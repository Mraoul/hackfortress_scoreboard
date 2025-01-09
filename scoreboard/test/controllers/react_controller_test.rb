# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class ReactControllerTest < BaseControllerTest
  test 'anybody calls react route' do
    get url_for(controller: 'react', action: :index)
    assert_response :success
  end
end
