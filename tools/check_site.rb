#!/usr/bin/env ruby
# frozen_string_literal: true

require "cgi"
require "date"
require "pathname"
require "shellwords"
require "set"
require "time"
require "uri"
require "yaml"

module SiteCheck
  FRONT_MATTER_PATTERN = /\A---\s*\r?\n(.*?)\r?\n---\s*(?:\r?\n|\z)/m
  LINK_PATTERN = /(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
  POST_EXTENSIONS = %w[.html .markdown .md].freeze
  ROOT_PAGE_EXTENSIONS = %w[.html .md].freeze
  SKIPPED_PAGE_FILES = Set["README.md"].freeze

  module_function

  def run!
    project_root = detect_project_root
    config = load_config(project_root)
    baseurl = normalize_baseurl(ENV.fetch("CHECK_BASEURL", config.fetch("baseurl", "")))
    site_url = config.fetch("url", "").to_s.strip
    site_dir = project_root / "_site"
    warnings = []
    errors = []

    puts "Project root: #{project_root}"
    puts "Build baseurl: #{baseurl.empty? ? '(empty)' : baseurl}"

    puts
    puts "==> Checking front matter"
    errors.concat(validate_posts(project_root, warnings))
    errors.concat(validate_root_pages(project_root))
    fail_check!(errors, warnings) unless errors.empty?

    puts
    puts "==> Building site"
    build_site(project_root, baseurl)

    puts
    puts "==> Checking internal links"
    errors.concat(check_internal_links(site_dir, site_url: site_url, baseurl: baseurl))
    fail_check!(errors, warnings) unless errors.empty?

    print_warnings(warnings)

    puts
    puts "All checks passed."
  end

  def detect_project_root(start_dir = Pathname.pwd)
    start_path = Pathname(start_dir).expand_path

    [start_path, *start_path.ascend.drop(1)].find do |candidate|
      (candidate / ".git").exist? || (candidate / "Gemfile").exist? || (candidate / "_config.yml").exist?
    end || start_path
  end

  def load_config(project_root)
    config_path = project_root / "_config.yml"
    YAML.safe_load(
      config_path.read,
      permitted_classes: [Date, Time],
      aliases: true
    ) || {}
  rescue Psych::SyntaxError => error
    warn "Failed to parse #{config_path}: #{error.message}"
    exit 1
  end

  def normalize_baseurl(raw_baseurl)
    value = raw_baseurl.to_s.strip
    return "" if value.empty? || value == "/"

    normalized = value.start_with?("/") ? value : "/#{value}"
    normalized.delete_suffix("/")
  end

  def validate_posts(project_root, warnings)
    post_files = Dir.glob((project_root / "_posts/**/*").to_s)
                    .map { |path| Pathname(path) }
                    .select { |path| path.file? && POST_EXTENSIONS.include?(path.extname.downcase) }
                    .sort
    errors = []

    post_files.each do |path|
      data, parse_errors = parse_front_matter(path)
      if parse_errors.any?
        errors.concat(parse_errors)
        next
      end

      title = data["title"].to_s.strip
      errors << "#{relative_path(path, project_root)}: missing `title`" if title.empty?

      post_date = parse_post_date(data["date"])
      if post_date.nil?
        errors << "#{relative_path(path, project_root)}: missing or invalid `date`"
      end

      prefix = path.basename.to_s[/\A(\d{4}-\d{2}-\d{2})-/, 1]
      if prefix.nil?
        errors << "#{relative_path(path, project_root)}: post filename must start with YYYY-MM-DD-"
      elsif post_date && prefix != post_date.strftime("%F")
        errors << "#{relative_path(path, project_root)}: front matter date #{post_date.strftime("%F")} does not match filename prefix #{prefix}"
      end

      categories = data["categories"]
      if categories.nil? || blank_collection?(categories)
        warnings << "#{relative_path(path, project_root)}: missing `categories`"
      elsif !valid_categories?(categories)
        errors << "#{relative_path(path, project_root)}: `categories` must be a string or an array of non-empty strings"
      end
    end

    puts "Checked #{post_files.length} post files."
    errors
  end

  def validate_root_pages(project_root)
    page_files = project_root.children
                             .select do |path|
                               path.file? &&
                                 ROOT_PAGE_EXTENSIONS.include?(path.extname.downcase) &&
                                 !SKIPPED_PAGE_FILES.include?(path.basename.to_s)
                             end
                             .sort
    errors = []

    page_files.each do |path|
      data, parse_errors = parse_front_matter(path)
      if parse_errors.any?
        errors.concat(parse_errors)
        next
      end

      title = data["title"].to_s.strip
      errors << "#{relative_path(path, project_root)}: missing `title`" if title.empty?
    end

    puts "Checked #{page_files.length} root page files."
    errors
  end

  def parse_front_matter(path)
    content = path.read
    match = FRONT_MATTER_PATTERN.match(content)
    return [nil, ["#{path.basename}: missing YAML front matter"]] unless match

    yaml = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true)
    unless yaml.is_a?(Hash)
      return [nil, ["#{path.basename}: front matter must parse to a YAML mapping"]]
    end

    [yaml, []]
  rescue Psych::SyntaxError => error
    [nil, ["#{path.basename}: invalid YAML front matter (#{error.message})"]]
  end

  def parse_post_date(value)
    case value
    when Date
      value
    when Time
      value.to_date
    else
      raw = value.to_s.strip
      return nil if raw.empty?

      Date.parse(raw)
    end
  rescue Date::Error
    nil
  end

  def blank_collection?(value)
    case value
    when Array
      value.empty? || value.all? { |item| item.to_s.strip.empty? }
    else
      value.to_s.strip.empty?
    end
  end

  def valid_categories?(value)
    case value
    when String
      !value.strip.empty?
    when Array
      !value.empty? && value.all? { |item| item.is_a?(String) && !item.strip.empty? }
    else
      false
    end
  end

  def build_site(project_root, baseurl)
    command = ["bundle", "exec", "jekyll", "build"]
    command += ["--baseurl", baseurl] unless baseurl.empty?

    puts "$ #{Shellwords.join(command)}"
    success = system({ "JEKYLL_ENV" => "production" }, *command, chdir: project_root.to_s)
    return if success

    warn
    warn "Jekyll build failed."
    exit 1
  end

  def check_internal_links(site_dir, site_url:, baseurl:)
    html_files = Dir.glob((site_dir / "**/*.html").to_s).map { |path| Pathname(path) }.sort
    site_uri = parse_site_uri(site_url)
    errors = []
    link_count = 0

    html_files.each do |path|
      content = path.read
      extract_links(content).each do |raw_url|
        next if skipped_url?(raw_url)

        resolution = resolve_internal_url(raw_url, source_path: path, site_dir: site_dir, site_uri: site_uri, baseurl: baseurl)
        next if resolution.nil?

        link_count += 1
        if resolution[:error]
          errors << "#{relative_path(path, site_dir)} -> #{raw_url}: #{resolution[:error]}"
          next
        end

        next if link_exists?(site_dir, resolution[:path])

        errors << "#{relative_path(path, site_dir)} -> #{raw_url}: target `#{resolution[:path]}` was not found in _site"
      end
    end

    puts "Checked #{html_files.length} HTML files and #{link_count} internal links."
    errors
  end

  def parse_site_uri(site_url)
    return nil if site_url.empty?

    URI.parse(site_url)
  rescue URI::InvalidURIError
    nil
  end

  def extract_links(content)
    uncommented = content.gsub(/<!--.*?-->/m, "")
    uncommented.scan(LINK_PATTERN).map { |captures| captures.compact.first.to_s.strip }.uniq
  end

  def skipped_url?(raw_url)
    raw = CGI.unescapeHTML(raw_url.to_s.strip)
    return true if raw.empty? || raw.start_with?("#")

    raw.match?(/\A(?:data|javascript|mailto|tel):/i)
  end

  def resolve_internal_url(raw_url, source_path:, site_dir:, site_uri:, baseurl:)
    url = CGI.unescapeHTML(raw_url.to_s.strip)
    target = strip_query_and_fragment(url)
    return nil if target.empty?

    if target.start_with?("http://", "https://")
      uri = URI.parse(target)
      return nil unless internal_site_uri?(uri, site_uri)

      return normalize_root_relative_path(decode_url_path(uri.path.to_s.empty? ? "/" : uri.path), baseurl)
    end

    return nil if target.start_with?("//")
    return normalize_root_relative_path(decode_url_path(target), baseurl) if target.start_with?("/")

    resolve_relative_path(decode_url_path(target), source_path: source_path, site_dir: site_dir)
  rescue URI::InvalidURIError
    { error: "invalid URL" }
  end

  def internal_site_uri?(uri, site_uri)
    return false unless site_uri

    uri.host == site_uri.host && (uri.port || uri.default_port) == (site_uri.port || site_uri.default_port)
  end

  def strip_query_and_fragment(url)
    url.split("#", 2).first.to_s.split("?", 2).first.to_s
  end

  def decode_url_path(path)
    URI::DEFAULT_PARSER.unescape(path)
  rescue ArgumentError
    path
  end

  def normalize_root_relative_path(path, baseurl)
    normalized = path.empty? ? "/" : path
    return { path: normalized } if baseurl.empty?

    return { path: "/" } if normalized == baseurl
    return { path: normalized.delete_prefix(baseurl) } if normalized.start_with?("#{baseurl}/")

    { error: "root-relative URL does not include configured baseurl #{baseurl}" }
  end

  def resolve_relative_path(target, source_path:, site_dir:)
    source_dir = source_path.dirname
    relative_source_dir = source_dir.relative_path_from(site_dir)
    resolved = (relative_source_dir / target).cleanpath.to_s
    return { error: "relative URL escapes the built site root" } if resolved == ".." || resolved.start_with?("../")

    normalized = resolved == "." ? "/" : "/#{resolved.delete_prefix('./')}"
    { path: normalized }
  end

  def link_exists?(site_dir, site_path)
    candidates = candidate_paths(site_dir, site_path)
    candidates.any?(&:file?)
  end

  def candidate_paths(site_dir, site_path)
    return [site_dir / "index.html"] if site_path == "/"

    relative = site_path.delete_prefix("/")
    primary = site_dir / relative
    candidates = [primary]
    candidates << (site_dir / relative / "index.html") if site_path.end_with?("/") || primary.extname.empty?
    candidates << (site_dir / "#{relative}.html") if primary.extname.empty?
    candidates.uniq
  end

  def print_warnings(warnings)
    return if warnings.empty?

    puts
    puts "Warnings:"
    warnings.sort.each do |warning|
      puts "  - #{warning}"
    end
  end

  def fail_check!(errors, warnings)
    print_warnings(warnings)

    warn
    warn "Check failed:"
    errors.sort.each do |error|
      warn "  - #{error}"
    end
    exit 1
  end

  def relative_path(path, root)
    path.relative_path_from(root).to_s
  end
end

SiteCheck.run!
