#!/usr/bin/env ruby
# frozen_string_literal: true

require "find"
require "fileutils"
require "open3"
require "optparse"
require "pathname"
require "set"
require "time"

module CombineCode
  OUTPUT_FILENAME = "full_project_source.txt"

  EXCLUDE_DIRS_ANYWHERE = Set[
    ".git",
    ".bundle",
    ".idea",
    ".jekyll-cache",
    ".sass-cache",
    ".svn",
    ".vscode",
    "node_modules",
    "__pycache__"
  ].freeze

  EXCLUDE_DIRS_ROOT_ONLY = Set[
    "_site",
    "tools",
    "vendor"
  ].freeze

  EXCLUDE_DIR_PATTERNS = [
    ".egg-info"
  ].freeze

  EXCLUDE_EXTENSIONS = Set[
    ".7z",
    ".avif",
    ".db",
    ".dll",
    ".doc",
    ".docx",
    ".eot",
    ".exe",
    ".feather",
    ".gif",
    ".gz",
    ".ico",
    ".jpeg",
    ".jpg",
    ".mov",
    ".mp3",
    ".mp4",
    ".otf",
    ".parquet",
    ".pdf",
    ".png",
    ".pyc",
    ".pyo",
    ".rar",
    ".so",
    ".sqlite3",
    ".svg",
    ".tar",
    ".ttf",
    ".wav",
    ".webm",
    ".webp",
    ".woff",
    ".woff2",
    ".xls",
    ".xlsx",
    ".zip"
  ].freeze

  EXCLUDE_FILES = Set[
    ".DS_Store",
    ".env",
    ".gitignore",
    "Thumbs.db",
    OUTPUT_FILENAME
  ].freeze

  module_function

  def detect_project_root(start_dir = Pathname.pwd)
    start_path = Pathname(start_dir).expand_path

    [start_path, *start_path.ascend.drop(1)].find do |candidate|
      (candidate / ".git").exist? || (candidate / "Gemfile").exist? || (candidate / "_config.yml").exist?
    end || start_path
  end

  def relative_path(path, project_root)
    path.relative_path_from(project_root).to_s
  end

  def root_only_exclude_dirs(include_tools:)
    dirs = EXCLUDE_DIRS_ROOT_ONLY.dup
    dirs.delete("tools") if include_tools
    dirs
  end

  def normalize_cli_path_prefix(prefix, project_root)
    raw = prefix.to_s.strip
    raise OptionParser::InvalidArgument, "path prefix cannot be empty" if raw.empty?

    path = Pathname(raw)
    relative = if path.absolute?
      expanded = path.expand_path
      project_root_path = project_root.expand_path

      unless expanded == project_root_path || expanded.to_s.start_with?("#{project_root_path}/")
        raise OptionParser::InvalidArgument, "path prefix must stay inside the project root: #{raw}"
      end

      expanded.relative_path_from(project_root_path).to_s
    else
      path.cleanpath.to_s
    end

    relative = relative.delete_prefix("./").delete_prefix("/")
    raise OptionParser::InvalidArgument, "path prefix cannot point to the project root itself" if relative.empty? || relative == "."
    raise OptionParser::InvalidArgument, "path prefix must stay inside the project root: #{raw}" if relative.start_with?("../")

    relative.tr("\\", "/")
  end

  def matches_prefix?(relative, prefix)
    relative == prefix || relative.start_with?("#{prefix}/")
  end

  def excluded_by_custom_prefix?(relative, exclude_prefixes)
    exclude_prefixes.any? { |prefix| matches_prefix?(relative, prefix) }
  end

  def excluded_dir_name?(dir_name)
    EXCLUDE_DIRS_ANYWHERE.include?(dir_name) || EXCLUDE_DIR_PATTERNS.any? { |pattern| dir_name.end_with?(pattern) }
  end

  def excluded_path?(path, project_root, output_path, include_tools:, exclude_prefixes:)
    expanded_path = path.expand_path
    return true if output_path && expanded_path == output_path.expand_path

    relative = relative_path(path, project_root)
    return true if excluded_by_custom_prefix?(relative, exclude_prefixes)

    parts = Pathname(relative).each_filename.to_a
    return true if parts.empty?

    file_name = parts.last
    return true if EXCLUDE_FILES.include?(file_name)

    root_excludes = root_only_exclude_dirs(include_tools: include_tools)
    dirs = parts[0...-1]
    dirs.each_with_index do |dir_name, index|
      return true if EXCLUDE_DIRS_ANYWHERE.include?(dir_name)
      return true if index.zero? && root_excludes.include?(dir_name)
      return true if EXCLUDE_DIR_PATTERNS.any? { |pattern| dir_name.end_with?(pattern) }
    end

    false
  end

  def likely_text_file?(path)
    return false unless path.file?
    return false if EXCLUDE_EXTENSIONS.include?(path.extname.downcase)

    sample = File.binread(path, 1024) || +""
    !sample.include?("\x00")
  rescue Errno::EACCES, Errno::ENOENT, Errno::EISDIR
    false
  end

  def collect_tracked_files(project_root)
    stdout, stderr, status = Open3.capture3("git", "-C", project_root.to_s, "ls-files", "-z")
    raise stderr unless status.success?

    stdout.split("\0").reject(&:empty?).map { |relative| project_root / relative }
  end

  def collect_optional_tools_files(project_root)
    tools_root = project_root / "tools"
    return [] unless tools_root.directory?

    files = []

    Find.find(tools_root.to_s) do |current|
      path = Pathname(current)

      if path.directory?
        if path != tools_root && excluded_dir_name?(path.basename.to_s)
          Find.prune
        end
        next
      end

      files << path
    end

    files
  end

  def collect_all_files(project_root, include_tools:)
    files = []
    root_excludes = root_only_exclude_dirs(include_tools: include_tools)

    Find.find(project_root.to_s) do |current|
      path = Pathname(current)

      if path.directory?
        if path != project_root
          parts = path.relative_path_from(project_root).each_filename.to_a
          dir_name = path.basename.to_s
          root_dir = parts.length == 1

          if excluded_dir_name?(dir_name) || (root_dir && root_excludes.include?(dir_name))
            Find.prune
          end
        end
        next
      end

      files << path
    end

    files
  end

  def read_text_file(path)
    File.binread(path).force_encoding(Encoding::UTF_8).scrub
  end

  def write_archive(paths:, project_root:, output_io:, mode_label:)
    included_paths = paths.map { |path| relative_path(path, project_root) }.sort

    output_io.puts "--- Project Source Code Archive ---"
    output_io.puts
    output_io.puts "Generated at: #{Time.now.iso8601}"
    output_io.puts "Project root: #{project_root}"
    output_io.puts "Mode: #{mode_label}"
    output_io.puts
    output_io.puts "--- Included Files ---"
    output_io.puts "Total files: #{included_paths.length}"
    output_io.puts
    included_paths.each { |line| output_io.puts(line) }
    output_io.puts
    output_io.puts "--- End of File List ---"
    output_io.puts

    paths.sort_by { |path| relative_path(path, project_root) }.each do |path|
      content = read_text_file(path).rstrip
      next if content.empty?

      relative = relative_path(path, project_root)
      output_io.puts "<#{relative}>"
      output_io.puts content
      output_io.puts "</#{relative}>"
      output_io.puts
    end
  end

  def build_archive(project_root:, output_path:, tracked_only:, include_tools:, exclude_prefixes:, verbose:, stdout_mode:)
    mode_label = tracked_only ? "git-tracked text files" : "all project text files"

    paths = if tracked_only
      collect_tracked_files(project_root)
    else
      collect_all_files(project_root, include_tools: include_tools)
    end

    paths.concat(collect_optional_tools_files(project_root)) if include_tools && tracked_only
    paths = paths.uniq(&:to_s)

    filtered_paths = paths.select do |path|
      !excluded_path?(
        path,
        project_root,
        output_path,
        include_tools: include_tools,
        exclude_prefixes: exclude_prefixes
      ) && likely_text_file?(path)
    end

    puts "Project root: #{project_root}"
    puts "Mode: #{mode_label}"
    puts "Including root tools/: yes" if include_tools
    puts "Extra excludes: #{exclude_prefixes.join(', ')}" unless exclude_prefixes.empty?
    puts "Included files: #{filtered_paths.length}"

    if verbose
      filtered_paths.sort_by { |path| relative_path(path, project_root) }.each do |path|
        puts "  + #{relative_path(path, project_root)}"
      end
    end

    if stdout_mode
      write_archive(paths: filtered_paths, project_root: project_root, output_io: $stdout, mode_label: mode_label)
      return
    end

    FileUtils.mkdir_p(output_path.dirname)
    File.open(output_path, "w:UTF-8") do |file|
      write_archive(paths: filtered_paths, project_root: project_root, output_io: file, mode_label: mode_label)
    end

    puts "Wrote archive to: #{output_path}"
  end
end

options = {
  exclude_prefixes: [],
  include_tools: false,
  output: CombineCode::OUTPUT_FILENAME,
  root: nil,
  stdout: false,
  tracked_only: true,
  verbose: false
}

parser = OptionParser.new do |opts|
  opts.banner = "Usage: ruby tools/combine_code.rb [options]"

  opts.on("--root PATH", "Project root directory (default: auto-detect)") do |value|
    options[:root] = Pathname(value).expand_path
  end

  opts.on("--output PATH", "Output path (default: full_project_source.txt under project root)") do |value|
    options[:output] = value
  end

  opts.on("--include-tools", "Include the root tools/ directory even though it is ignored by default") do
    options[:include_tools] = true
  end

  opts.on("--exclude PATH_PREFIX", "Exclude a relative path prefix under the project root; can be used multiple times") do |value|
    options[:exclude_prefixes] << value
  end

  opts.on("--all-files", "Scan the project tree instead of only git-tracked files") do
    options[:tracked_only] = false
  end

  opts.on("--tracked-only", "Only include git-tracked files (default)") do
    options[:tracked_only] = true
  end

  opts.on("--stdout", "Write the archive to stdout instead of a file") do
    options[:stdout] = true
  end

  opts.on("-v", "--verbose", "Print included files while building the archive") do
    options[:verbose] = true
  end

  opts.on("-h", "--help", "Show this help") do
    puts opts
    exit
  end
end

parser.parse!(ARGV)

project_root = options[:root] || CombineCode.detect_project_root
project_root = project_root.expand_path
exclude_prefixes = options[:exclude_prefixes].map do |prefix|
  CombineCode.normalize_cli_path_prefix(prefix, project_root)
end.uniq

output_path = if options[:stdout]
  nil
else
  candidate = Pathname(options[:output])
  candidate.absolute? ? candidate.expand_path : (project_root / candidate).expand_path
end

CombineCode.build_archive(
  project_root: project_root,
  output_path: output_path,
  exclude_prefixes: exclude_prefixes,
  include_tools: options[:include_tools],
  tracked_only: options[:tracked_only],
  verbose: options[:verbose],
  stdout_mode: options[:stdout]
)
