#!/bin/sh

# Wait for the database to be ready
echo "Waiting for the database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Database is ready."

# Run migrations and seeders
echo "Running migrations and seeders..."
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
echo "Migrations completed."

# Start the application
# Ensure the dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: dist directory does not exist. Please build the application first."
  exit 1
fi

# Run the application
echo "Running the application..."
# Use node to run the compiled JavaScript files in the dist directory
# This assumes that the entry point of your application is dist/index.js
if [ ! -f "dist/index.js" ]; then
  echo "Error: dist/index.js does not exist. Please build the application first."
  exit 1
fi

# Execute the application
exec node dist/index.js