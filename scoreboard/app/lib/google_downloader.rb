require "google/cloud/storage"

module GoogleDownloader
  module_function

  def generate_url(filename, expiry = 1)
    config = Rails.application.config.x.gcloud
    expiry_time = expiry * 60

    storage = GCloudStorageClient.instance.client

    begin
      bucket = storage.bucket(config[:bucket])
    rescue
      Rails.logger.error("Unable to query bucket from googe cloud")
      return nil
    end

    if bucket.nil?
      Rails.logger.error("Request for non-existant bucket #{config[:bucket]}")
      return nil
    end

    begin
      file = bucket.file(filename)
    rescue
      Rails.logger.error("Unable to query file from google cloud")
      return nil
    end

    if file.nil?
      Rails.logger.error("Request for non-existant file #{filename}")
      return nil
    end

    begin
      if (file.content_disposition != "attachment")
        file.content_disposition = "attachment"
      end
    rescue
      Rails.logger.error("Unable to check or change content disposition type to 'attachment'")
    end

    begin
      shared_url = file.signed_url(
        method: "GET",
        expires: expiry_time
      )
      return shared_url
    rescue
      Rails.logger.error("Unable to generate signed url for file #{filename} in bucket #{config[:bucket]}")
      return nil
    end
  end
end
