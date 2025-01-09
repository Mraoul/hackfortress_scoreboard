class Team < ApplicationRecord
  has_many :particpants
  has_many :players, :dependent => :destroy
  has_one :user, :dependent => :destroy

  after_create :create_user, :create_players

  validates_presence_of :name
  validates_uniqueness_of :name


  private

  def create_user
    # Create a User for this team
    User.create(
      # Remove spaces in name
      :username => self.name.delete(' ').downcase,
      :password => User.passhash(rand(2000).to_s),
      :role => 'contestant',
      :team_id => self.id
    )
  end

  def create_players
    # Create Players for this team
    Player.create(:name => "Team Effort", :email => "Team Email", :team_id => self.id)
    (1..4).each do |i|
      Player.create(:name => ("Player " + i.to_s), :email => "Player Email", :team_id => self.id)
    end
  end

end
