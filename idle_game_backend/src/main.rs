use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, SqlitePool, FromRow};
use std::env;
use uuid::Uuid;

#[derive(Serialize, Deserialize, FromRow)]
struct User {
    id: Uuid,
    username: String,
}

#[derive(Serialize, Deserialize, FromRow)]
struct InventoryItem {
    id: Uuid,
    user_id: Uuid,
    item_name: String,
    quantity: i32,
}

async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::migrate!("./migrations").run(pool).await?;
    Ok(())
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let pool = SqlitePool::connect(&env::var("DATABASE_URL").expect("DATABASE_URL must be set"))
        .await
        .expect("Failed to create pool.");

    run_migrations(&pool).await.expect("Failed to run migrations");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))  // Use .app_data instead of .data
            .route("/users", web::post().to(create_user))
            .route("/inventory/{user_id}", web::get().to(get_inventory))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

async fn create_user(pool: web::Data<SqlitePool>, new_user: web::Json<User>) -> impl Responder {
    let new_user = new_user.into_inner();
    let query = "INSERT INTO users (id, username) VALUES (?, ?)";

    sqlx::query(query)
        .bind(new_user.id.to_string())  // Ensure UUID is converted to string
        .bind(new_user.username.clone())  // Clone the username to avoid partial move
        .execute(pool.get_ref())
        .await
        .expect("Failed to insert user");

    HttpResponse::Ok().json(new_user)
}

async fn get_inventory(pool: web::Data<SqlitePool>, user_id: web::Path<Uuid>) -> impl Responder {
    let query = "SELECT * FROM inventory WHERE user_id = ?";
    let items: Vec<InventoryItem> = sqlx::query_as(query)
        .bind(user_id.to_string())  // Ensure UUID is converted to string
        .fetch_all(pool.get_ref())
        .await
        .expect("Failed to fetch inventory");

    HttpResponse::Ok().json(items)
}
