require "sneakers"
Sneakers.configure	heartbeat: 2,
  amqp: Rails.application.credentials.dig(Rails.env.to_sym, :amqp_url),
  vhost: "/",
  exchange: "hackfortress",
  exchange_type: :topic,
  runner_config_file: nil,  # A configuration file (see below)
  metrics: nil,             # A metrics provider implementation
  daemonize: false, # Send to background
  start_worker_delay: 0.2,  # When workers do frenzy-die, randomize to avoid resource starvation
  workers: 4,               # Number of per-cpu processes to run
  pid_path: "tmp/pids/sneakers.pid"
