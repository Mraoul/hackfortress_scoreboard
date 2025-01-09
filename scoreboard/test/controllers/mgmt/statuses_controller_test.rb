# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class StatusesControllerTest < BaseControllerTest
  test 'admin list statuses' do
    get url_for(controller: 'api/mgmt/statuses', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
  end

  test 'admin creates cap_block' do
    post url_for(controller: 'api/mgmt/statuses', action: :create), params: {
      team: 1, # red team
      event: 'cap_block'
    }, headers: @admin_headers
    assert_response :success
    assert_not Status.count.zero?
  end

  test 'admin cant create cap block bad team' do
    post url_for(controller: 'api/mgmt/statuses', action: :create), params: {
      team: 3,
      event: 'cap_block'
    }, headers: @admin_headers
    assert_response :bad_request
  end

  test 'admin cant create status unknown status' do
    post url_for(controller: 'api/mgmt/statuses', action: :create), params: {
      team: 1,
      event: 'no_such_status'
    }, headers: @admin_headers
    assert_response :bad_request
  end

  test 'admin deletes status' do
    # Need to create one first
    post url_for(controller: 'api/mgmt/statuses', action: :create), params: {
      team: 1, # red team
      event: 'cap_block'
    }, headers: @admin_headers

    status = Status.first

    delete url_for(controller: 'api/mgmt/statuses', action: :destroy, id: status.id), headers: @admin_headers
    assert_response :success
  end
end
