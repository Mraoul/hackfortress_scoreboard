# frozen_string_literal: true

# React Controller
class ReactController < ActionController::API
  def index
    render template: 'react/index', layout: false, content_type: 'text/html'
  end
end
