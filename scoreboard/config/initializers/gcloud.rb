require "google/cloud/storage"

class GCloudStorageClient
  include Singleton

  def client
    config = Rails.application.config.x.gcloud

    @_client ||= Google::Cloud::Storage.new(
      project_id: config[:project_id],
      credentials: config[:credentials]
    )
  end
end
