SELECT * FROM api50group_local.products;
select * from productImages;
select * from products;
SHOW DATABASES;
SELECT * FROM Materials;



-- 1. Materials
INSERT INTO Materials (Name) VALUES
('Cotton'),
('Leather'),
('Polyester');

-- 2. Styles
INSERT INTO Styles (Name) VALUES
('Casual'),
('Sport'),
('Formal');

-- 3. Genders
INSERT INTO Genders (Name) VALUES
('Male'),
('Female'),
('Unisex');

-- 4. Origins
INSERT INTO Origins (Country) VALUES
('Vietnam'),
('USA'),
('Japan');

-- 5. Categories
INSERT INTO Categories (Name, Description) VALUES
('T-Shirt', 'Casual T-Shirt'),
('Shoes', 'Sports Shoes'),
('Bag', 'Leather Bag');
