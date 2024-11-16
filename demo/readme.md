# Birdhouse Demo Server
This sub-directory implements an example Birdhouse server, running the backend and the frontend on your local machine.

You'll need XAMPP, with both the Apache and MySQL components installed. Run both of the services, and create a `birdhouse` database. Import the `/backend/db/schema.sql` file via e.g. phpMyAdmin, and you're good to go! If you have existing Birdhouse data that you'd like to remove, use `/backend/db/destroy.sql` before. Do note that this is a destructive action, and cannot be reverted.

