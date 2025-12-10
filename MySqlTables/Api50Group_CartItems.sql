-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 160.250.5.26    Database: Api50Group
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CartItems`
--

DROP TABLE IF EXISTS `CartItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CartItems` (
  `CartItemId` int NOT NULL AUTO_INCREMENT,
  `Quantity` int NOT NULL,
  `Price` decimal(65,30) NOT NULL,
  `ProductVariantId` int NOT NULL,
  `CartId` int NOT NULL,
  PRIMARY KEY (`CartItemId`),
  KEY `IX_CartItems_CartId` (`CartId`),
  KEY `IX_CartItems_ProductVariantId` (`ProductVariantId`),
  CONSTRAINT `FK_CartItems_Carts_CartId` FOREIGN KEY (`CartId`) REFERENCES `Carts` (`CartId`) ON DELETE CASCADE,
  CONSTRAINT `FK_CartItems_ProductVariants_ProductVariantId` FOREIGN KEY (`ProductVariantId`) REFERENCES `ProductVariants` (`ProductVariantId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CartItems`
--

LOCK TABLES `CartItems` WRITE;
/*!40000 ALTER TABLE `CartItems` DISABLE KEYS */;
/*!40000 ALTER TABLE `CartItems` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:45:53
