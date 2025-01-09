# frozen_string_literal: true

require 'test_helper'

class CategoryTest < ActiveSupport::TestCase
  setup do
  end

  test 'create category' do
    cat = Category.new(name: 'test category')
    assert cat.valid?
  end

  test 'category requires name' do
    cat = Category.new
    assert_not cat.valid?
  end
end
