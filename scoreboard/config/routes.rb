Rails.application.routes.draw do
  namespace :api do
    # Session Routes
    post "login" => "sessions#login"
    get "logout" => "sessions#logout"
    get "validate_token" => "sessions#validate_token"
    get "sessionstatus" => "sessions#status"
    post "sessioninvalidate" => "sessions#invalidate"

    # Contestant Routes
    get "list_players" => "contestants#list_players"
    post "change_password" => "contestants#change_password"
    post "update_player" => "contestants#update_player"

    # Puzzle routes
    get "roundpuzzles/:color" => "puzzles#round_puzzles"
    post "submit_solution" => "puzzles#submit_solution"
    get "puzzle/download/:id" => "puzzles#download_file"

    # Hackonomy Routes
    get "storefront/" => "hackonomy#storefront", :color => "None"
    get "storefront/:color" => "hackonomy#storefront"
    post "purchaseItem" => "hackonomy#purchase_item"

    namespace :mgmt do
      resources :purchases, only: %i[index destroy]
      resources :submissions, only: [:index]
      resources :submission_attempts, only: [:index]
      resources :users, only: %i[index create update destroy]
      resources :player_points, only: [:index]
      resources :players, only: %i[index create update destroy]
      resources :purchases, only: %i[index create destroy]

      resources :inventories, only: %i[index update]
      match "inventories/round/:round_id" => "inventories#byRound", :via => [:get]

      match "puzzles/stats" => "puzzles#stats", :via => [:get]
      resources :puzzles, only: %i[create update destroy]

      resources :puzzlesets, only: %i[index show create update destroy]
      resources :participants, only: %i[index update]
      match "participants/bonus/:id" => "participants#bonus_grant", :via => [:post]
      match "participants/patch/:id" => "participants#patch", :via => [:patch]

      resources :teams, only: %i[index create update destroy]
      match "categories/export" => "categories#export", :via => [:get] # need these to take priority
      match "categories/upload_json" => "categories#upload_json", :via => [:post]
      match "categories/upload_csv" => "categories#upload_csv", :via => [:post]
      resources :categories, only: %i[index create update destroy show] do
        resources :puzzles, only: %i[create update destroy]
      end

      match "item_groups/export" => "item_groups#export", :via => [:get]
      match "item_groups/import" => "item_groups#import", :via => [:post]
      resources :item_groups, only: %i[index create update destroy show] do
        resources :items, only: %i[create update destroy]
      end

      # Rounds
      resources :rounds, only: %i[index create update destroy]
      get "rounds/console" => "rounds#round_console"
      post "console/bonus" => "rounds#console_bonus"
      match "challenges/:puzzleset_id" => "rounds#puzzleviewer", :via => [:get]
      # match 'challenges' => 'rounds#puzzleviewer', :via => [:get]
      # match 'viewer' => 'rounds#viewer', :via => [:get]
      # #match 'console/update' => 'rounds#console_update', :via => [:get]
      post "rounds/automation" => "rounds#automation"
      post "rounds/gamestart" => "rounds#force_game_start"
      post "rounds/gameend" => "rounds#force_game_end"
      match "rounds/unlock" => "rounds#force_unlock", :via => %i[get post]
      post "rounds/:id/live" => "rounds#activate_round"
      post "rounds/:id/ready" => "rounds#ready_round"

      # Stores
      resources :stores, only: [:index]
      match "stores/" => "stores#update", :via => %i[patch put]
      match "stores/reset" => "stores#reset", :via => [:post]

      resources :statuses, only: %i[index create destroy]

      resources :sessions, only: %i[index destroy]
    end

    match "*path", to: "application#no_route", via: :all
  end

  root to: "react#index", via: :all
  # Catch all route
  match "*path", to: "react#index", via: :all
end
