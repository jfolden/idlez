CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL
);

CREATE TABLE inventory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
