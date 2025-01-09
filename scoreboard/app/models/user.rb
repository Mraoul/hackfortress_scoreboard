class User < ApplicationRecord
  enum role: {
    admin: "a",
    judge: "j",
    contestant: "c"
  }, _prefix: :role
  belongs_to :team, optional: true
  validates_uniqueness_of :username
  validates_presence_of :username, :password, :role

  def self.passhash(password)
    return Digest::SHA1.hexdigest(password)
  end
end
