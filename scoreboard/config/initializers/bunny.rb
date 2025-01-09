# if defined?(PhusionPassenger) # otherwise it breaks rake commands if you put this in an initializer
#   PhusionPassenger.on_event(:starting_worker_process) do |forked|
#     if forked
#        # We’re in a smart spawning mode
#        # Now is a good time to connect to RabbitMQ
#        $rabbitmq_connection = Bunny.new("amqp://guest:guest@192.168.100.10:5672");
#      $rabbitmq_connection.start
#        $rabbitmq_channel = $rabbitmq_connection.create_channel
#     end
#   end
# end
$rabbitmq_connection = Bunny.new(Rails.application.credentials.dig(Rails.env.to_sym, :amqp_url))
$rabbitmq_connection.start
$rabbitmq_channel = $rabbitmq_connection.create_channel
