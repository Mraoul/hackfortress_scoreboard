# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

DEVELOPMENT_IP = ENV.fetch("RAILS_DEV_IP") { nil }
DEVELOPMENT_HOSTNAME = ENV.fetch("RAILS_DEV_HOSTNAME") { nil }

Rails.application.configure do
  config.content_security_policy do |policy|
    if Rails.env.development?
      policy.connect_src(
        :self, :http,
        :unsafe_eval,
        "http://localhost:3036",
        "ws://localhost:3036",
      )

      if DEVELOPMENT_IP
        policy.connect_src(*policy.connect_src,
          "http://#{DEVELOPMENT_IP}:3036",
          "ws://#{DEVELOPMENT_IP}:3036",
        )
      end

      if DEVELOPMENT_HOSTNAME
        policy.connect_src(*policy.connect_src,
          "http://#{DEVELOPMENT_HOSTNAME}:3036",
          "ws://#{DEVELOPMENT_HOSTNAME}:3036",
        )
      end

      # Allow @vite/client to hot reload changes in development
      policy.connect_src(*policy.connect_src, "ws://#{ViteRuby.config.host_with_port}") if Rails.env.development?
    end
    #   policy.default_src :self, :https
    #   policy.font_src    :self, :https, :data
    #   policy.img_src     :self, :https, :data
    #   policy.object_src  :none
    #   policy.script_src  :self, :https
    # Specify URI for violation reports
    # policy.report_uri "/csp-violation-report-endpoint"

    # Allow @vite/client to hot reload javascript changes in development
    # if Rails.env.development?
    #   policy.script_src(*policy.script_src, :unsafe_eval,
    #                     "http://#{ViteRuby.config.host_with_port}")
    # end

    # You may need to enable this in production as well depending on your setup.
    # policy.script_src *policy.script_src, :blob if Rails.env.test?

    # policy.style_src   :self, :https

    # Allow @vite/client to hot reload style changes in development
    # policy.style_src(*policy.style_src, :unsafe_inline) if Rails.env.development?

    # Specify URI for violation reports
    # policy.report_uri "/csp-violation-report-endpoint"
  end

  # # Generate session nonces for permitted importmap and inline scripts
  # config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
  # config.content_security_policy_nonce_directives = %w(script-src)

  # # Report violations without enforcing the policy.
  # # config.content_security_policy_report_only = true
end
