workers 2

threads 5, 25

#root = "#{Dir.getwd}"

app_dir = File.expand_path("../..", __FILE__)
print app_dir
shared_dir = "#{app_dir}/shared"

#activate_control_app "tcp://0.0.0.0:9293", { no_token: true }

bind "unix:///#{shared_dir}/sockets/puma.sock"
bind "tcp://0.0.0.0:8080"

# Set master PID and state locations
pidfile "#{shared_dir}/pids/puma.pid"
rackup "#{app_dir}/config.ru"
state_path "#{shared_dir}/pids/puma.state"
activate_control_app
