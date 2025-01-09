if [[ -z "${RAILS_ENV}" ]]; then
RAILS_ENV=development
fi

echo "Starting ${RAILS_ENV} Worker"

WORKERS=Tf2Worker rails sneakers:run