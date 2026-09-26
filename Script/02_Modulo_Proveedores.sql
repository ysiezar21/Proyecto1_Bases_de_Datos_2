USE WideWorldImporters;
GO

-- ============================================
-- Synonyms nuevos para Proveedores
-- (Syn.People, Syn.DeliveryMethods y Syn.Cities ya existen del modulo de Clientes)
-- ============================================
IF OBJECT_ID('Syn.Suppliers', 'SN') IS NOT NULL DROP SYNONYM Syn.Suppliers;
CREATE SYNONYM Syn.Suppliers FOR Purchasing.Suppliers;
GO

IF OBJECT_ID('Syn.SupplierCategories', 'SN') IS NOT NULL DROP SYNONYM Syn.SupplierCategories;
CREATE SYNONYM Syn.SupplierCategories FOR Purchasing.SupplierCategories;
GO

-- ============================================
-- SP auxiliar para poblar el combo de categorias
-- ============================================
CREATE OR ALTER PROCEDURE Api.usp_Proveedores_Categorias
AS
BEGIN
    SET NOCOUNT ON;
    SELECT SupplierCategoryID, SupplierCategoryName
    FROM Syn.SupplierCategories
    ORDER BY SupplierCategoryName;
END
GO

-- ============================================
-- SP: Listado de proveedores (nombre + categoria, orden alfabetico)
-- ============================================
CREATE OR ALTER PROCEDURE Api.usp_Proveedores_Listar
    @Nombre NVARCHAR(100) = NULL,
    @SupplierCategoryID INT = NULL,
    @DeliveryMethodID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        s.SupplierID,
        s.SupplierName AS Nombre,
        sc.SupplierCategoryName AS Categoria,
        dm.DeliveryMethodName AS MetodoEntrega
    FROM Syn.Suppliers s
    LEFT JOIN Syn.SupplierCategories sc ON sc.SupplierCategoryID = s.SupplierCategoryID
    LEFT JOIN Syn.DeliveryMethods dm ON dm.DeliveryMethodID = s.DeliveryMethodID
    WHERE (@Nombre IS NULL OR s.SupplierName LIKE '%' + @Nombre + '%')
      AND (@SupplierCategoryID IS NULL OR s.SupplierCategoryID = @SupplierCategoryID)
    ORDER BY s.SupplierName ASC;
END
GO

-- ============================================
-- SP: Detalle de un proveedor (incluye datos bancarios)
-- ============================================
CREATE OR ALTER PROCEDURE Api.usp_Proveedores_Detalle
    @SupplierID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        s.SupplierID,
        s.SupplierReference AS CodigoProveedor,
        s.SupplierName AS Nombre,
        sc.SupplierCategoryName AS Categoria,
        pc.FullName AS ContactoPrimario,
        ac.FullName AS ContactoAlterno,
        dm.DeliveryMethodName AS MetodoEntrega,
        city.CityName AS CiudadEntrega,
        s.DeliveryPostalCode AS CodigoPostal,
        s.PhoneNumber AS Telefono,
        s.FaxNumber AS Fax,
        s.WebsiteURL AS SitioWeb,
        s.DeliveryAddressLine1 AS DireccionEntrega1,
        s.DeliveryAddressLine2 AS DireccionEntrega2,
        s.PostalAddressLine1 AS DireccionPostal1,
        s.PostalAddressLine2 AS DireccionPostal2,
        s.DeliveryLocation.Lat AS Latitud,
        s.DeliveryLocation.Long AS Longitud,
        s.BankAccountName AS NombreBanco,
        s.BankAccountNumber AS NumeroCuenta,
        s.PaymentDays AS DiasGraciaPago
    FROM Syn.Suppliers s
    LEFT JOIN Syn.SupplierCategories sc ON sc.SupplierCategoryID = s.SupplierCategoryID
    LEFT JOIN Syn.People pc ON pc.PersonID = s.PrimaryContactPersonID
    LEFT JOIN Syn.People ac ON ac.PersonID = s.AlternateContactPersonID
    LEFT JOIN Syn.DeliveryMethods dm ON dm.DeliveryMethodID = s.DeliveryMethodID
    LEFT JOIN Syn.Cities city ON city.CityID = s.DeliveryCityID
    WHERE s.SupplierID = @SupplierID;
END
GO

-- ============================================
-- Pruebas rapidas (correr sueltas para probar)
-- ============================================
-- EXEC Api.usp_Proveedores_Categorias;
-- EXEC Api.usp_Proveedores_Listar;
-- EXEC Api.usp_Proveedores_Listar @Nombre = 'a';
-- EXEC Api.usp_Proveedores_Detalle @SupplierID = 1;