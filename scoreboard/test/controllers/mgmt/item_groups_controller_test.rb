# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class ItemGroupsControllerTest < BaseControllerTest
  test 'admin list itemgroups' do
    get url_for(controller: 'api/mgmt/item_groups', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert response_json.length.positive?
    assert_includes response_json[0], 'name'
    assert_includes response_json[0], 'description'
  end

  test 'admin get itemgroup' do
    get url_for(controller: 'api/mgmt/item_groups', action: :show, id: item_groups(:item_group1).id),
        headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'name'
    assert_includes response_json, 'items'
    assert response_json['items'].length.positive?
    assert_includes response_json['items'][0], 'name'
  end

  test 'admin create itemgroup' do
    post url_for(controller: 'api/mgmt/item_groups', action: :create),
         params: {
           item_group: {
             name: 'TestGroup',
             description: 'TestDescription',
             picture_location: '',
             discountable: true,
             hack_item: true
           }
         },
         headers: @admin_headers

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'name'
    assert_includes response_json, 'description'
    assert response_json['name'] == 'TestGroup'
  end

  test 'admin update itemgroup' do
    put url_for(controller: 'api/mgmt/item_groups', action: :update, id: item_groups(:item_group1).id),
        params: {
          item_group: {
            name: 'TestGroup'
          }
        },
        headers: @admin_headers

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'name'
    assert_includes response_json, 'description'
    assert response_json['name'] == 'TestGroup'
    item_groups(:item_group1).reload
    assert item_groups(:item_group1).name == 'TestGroup'
  end

  test 'admin destroy itemgroup' do
    delete url_for(controller: 'api/mgmt/item_groups', action: :update, id: item_groups(:item_group1).id),
           headers: @admin_headers
    assert_response :success
    assert_raises do
      item_groups(:item_group1).reload
    end
  end
end
