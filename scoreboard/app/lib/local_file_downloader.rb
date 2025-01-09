module LocalFileDownloader
  module_function

  def get_filepath(filename)
    directory = Rails.application.config.x.localstorage[:directory]
    return nil if directory.nil?

    File.join(directory, filename)
  end
end
