package main

import (
	"log"

	"github.com/anushkasharma/lumora/internal/config"
	"github.com/anushkasharma/lumora/internal/middleware"
	"github.com/anushkasharma/lumora/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadEnv(); err != nil {
		log.Fatal("failed to load .env: ", err)
	}

	db, err := config.ConnectDatabase()
	if err != nil {
		log.Fatal("failed to connect database: ", err)
	}

	defer db.Close()

	router := gin.Default()

	router.Use(middleware.CORS())

	routes.RegisterRoutes(router, db)

	log.Println("Lumora backend running on http://localhost:8080")

	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
