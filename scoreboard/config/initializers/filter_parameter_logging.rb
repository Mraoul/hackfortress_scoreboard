# Be sure to restart your server when you modify this file.

# Configure parameters to be partially matched (e.g. passw matches password) and filtered from the log file.
# Use this to limit dissemination of sensitive information.
# See the ActiveSupport::ParameterFilter documentation for supported notations and behaviors.
Rails.application.config.filter_parameters += [
  :passw, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn
]
Rails.application.config.filter_parameters += [:password]
Rails.application.config.filter_parameters += [:password1]
Rails.application.config.filter_parameters += [:password2]
Rails.application.config.filter_parameters += [:pass]
