# frozen_string_literal: true

require 'test_helper'

class LocalFileDownloaderTest < ActionDispatch::IntegrationTest
  test 'get filepath' do
    mock = Minitest::Mock.new

    File.stub :join, 'testpath' do
      filepath = LocalFileDownloader.get_filepath('testfile')
      assert filepath == 'testpath'
    end
  end
end
