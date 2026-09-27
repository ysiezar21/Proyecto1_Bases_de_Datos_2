USE WideWorldImporters;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Syn')
    EXEC('CREATE SCHEMA Syn');
GO
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Api')
    EXEC('CREATE SCHEMA Api');
GO

IF OBJECT_ID('Syn.Customers', 'SN') IS NOT NULL DROP SYNONYM Syn.Customers;
CREATE SYNONYM Syn.Customers FOR Sales.Customers;
GO
 
IF OBJECT_ID ('Syn.CustomerCategories', 'SN') IS NOT NULL DROP SYNONYM Syn.CustomerCategories;
CREATE SYNONYM Syn.CustomerCategories FOR Sales.CustomerCategories;
GO

IF OBJECT_ID ('Syn.BuyingGroups', 'SN') IS NOT NULL DROP SYNONYM Syn.BuyingGroups;
CREATE SYNONYM Syn.BuyingGroups FOR Sales.BuyingGroups;
GO

IF OBJECT_ID ('Syn.People', 'SN') IS NOT NULL DROP SYNONYM Syn.People;
CREATE SYNONYM Syn.People FOR Application.People;
GO

IF OBJECT_ID ('Syn.DeliveryMethods', 'SN') IS NOT NULL DROP SYNONYM Syn.DeliveryMethods;
CREATE SYNONYM Syn.DeliveryMethods FOR Application.DeliveryMethods;
GO

IF OBJECT_ID ('Syn.Cities', 'SN') IS NOT NULL DROP SYNONYM Syn.Cities;
CREATE SYNONYM Syn.Cities FOR Application.Cities;
GO

CREATE OR ALTER PROCEDURE Api.usp_Clientes_Categorias
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CustomerCategoryID, CustomerCategoryName
    FROM Syn.CustomerCategories
    ORDER BY CustomerCategoryName;
END
GO

CREATE OR ALTER PROCEDURE Api.usp_MetodosEntrega_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DeliveryMethodID, DeliveryMethodName
    FROM Syn.DeliveryMethods
    ORDER BY DeliveryMethodName;
END
GO

CREATE OR ALTER PROCEDURE Api.usp_Clientes_Listar
    @Nombre NVARCHAR(100) = NULL,
    @CustomerCategoryID INT = NULL,
    @DeliveryMethodID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        c.CustomerID,
        c.CustomerName AS Nombre,
        cc.CustomerCategoryName AS Categoria,
        dm.DeliveryMethodName AS MetodoEntrega
    FROM Syn.Customers c
    INNER JOIN Syn.CustomerCategories cc ON cc.CustomerCategoryID = c.CustomerCategoryID
    INNER JOIN Syn.DeliveryMethods dm ON dm.DeliveryMethodID = c.DeliveryMethodID
    WHERE (@Nombre IS NULL OR c.CustomerName LIKE '%' + @Nombre + '%')
      AND (@CustomerCategoryID IS NULL OR c.CustomerCategoryID = @CustomerCategoryID)
      AND (@DeliveryMethodID IS NULL OR c.DeliveryMethodID = @DeliveryMethodID)
    ORDER BY c.CustomerName ASC;
END
GO

CREATE OR ALTER PROCEDURE Api.usp_Clientes_Detalle
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.CustomerID,
        c.CustomerName AS Nombre,
        cc.CustomerCategoryName AS Categoria,
        bg.BuyingGroupName AS GrupoCompra,
        pc.FullName AS ContactoPrimario,
        ac.FullName AS ContactoAlterno,
        bill.CustomerName AS ClientePorFacturar,
        dm.DeliveryMethodName AS MetodoEntrega,
        city.CityName AS CiudadEntrega,
        c.DeliveryPostalCode AS CodigoPostal,
        c.PhoneNumber AS Telefono,
        c.WebsiteURL AS SitioWeb,
        c.FaxNumber AS Fax,
        c.PaymentDays AS DiasGraciaPago,
        c.DeliveryAddressLine1 AS DireccionEntrega1,
        c.DeliveryAddressLine2 AS DireccionEntrega2,
        c.PostalAddressLine1 AS DireccionPostal1,
        c.PostalAddressLine2 AS DireccionPostal2,
        c.DeliveryLocation.Lat AS Latitud,
        c.DeliveryLocation.Long AS Longitud
    FROM Syn.Customers c
    INNER JOIN Syn.CustomerCategories cc
        ON cc.CustomerCategoryID = c.CustomerCategoryID
    LEFT JOIN Syn.BuyingGroups bg
        ON bg.BuyingGroupID = c.BuyingGroupID
    LEFT JOIN Syn.People pc
        ON pc.PersonID = c.PrimaryContactPersonID
    LEFT JOIN Syn.People ac
        ON ac.PersonID = c.AlternateContactPersonID
    LEFT JOIN Syn.Customers bill
        ON bill.CustomerID = c.BillToCustomerID
    INNER JOIN Syn.DeliveryMethods dm
        ON dm.DeliveryMethodID = c.DeliveryMethodID
    LEFT JOIN Syn.Cities city
        ON city.CityID = c.DeliveryCityID
    WHERE c.CustomerID = @CustomerID;
END
GO

-- ============================================
-- CLIENTES: Crear
-- ============================================
CREATE OR ALTER PROCEDURE Api.usp_Clientes_Crear
    @CustomerName NVARCHAR(100),
    @CustomerCategoryID INT,
    @DeliveryMethodID INT,
    @DeliveryCityID INT,
    @PrimaryContactPersonID INT,
    @PhoneNumber NVARCHAR(20) = NULL,
    @WebsiteURL NVARCHAR(256) = NULL,
    @DeliveryAddressLine1 NVARCHAR(60) = '',
    @DeliveryPostalCode NVARCHAR(10) = '00000',
    @PaymentDays INT = 30,
    @NuevoCustomerID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
 
        DECLARE @SistemaPersonID INT = (SELECT MIN(PersonID) FROM Syn.People);
 
        INSERT INTO Syn.Customers (
            CustomerName, BillToCustomerID, CustomerCategoryID,
            PrimaryContactPersonID, DeliveryMethodID, DeliveryCityID,
            PostalCityID, PhoneNumber, WebsiteURL,
            DeliveryAddressLine1, DeliveryPostalCode,
            PostalAddressLine1, PostalPostalCode,
            PaymentDays, AccountOpenedDate,
            IsStatementSent, IsOnCreditHold, LastEditedBy
        )
        VALUES (
            @CustomerName, NULL, @CustomerCategoryID,
            @PrimaryContactPersonID, @DeliveryMethodID, @DeliveryCityID,
            @DeliveryCityID, @PhoneNumber, @WebsiteURL,
            @DeliveryAddressLine1, @DeliveryPostalCode,
            @DeliveryAddressLine1, @DeliveryPostalCode,
            @PaymentDays, GETDATE(),
            0, 0, @SistemaPersonID
        );
 
        SET @NuevoCustomerID = SCOPE_IDENTITY();
 
        UPDATE Syn.Customers
        SET BillToCustomerID = @NuevoCustomerID
        WHERE CustomerID = @NuevoCustomerID;
 
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
 
-- ============================================
-- CLIENTES: Modificar
-- ============================================
CREATE OR ALTER PROCEDURE Api.usp_Clientes_Modificar
    @CustomerID INT,
    @CustomerName NVARCHAR(100),
    @CustomerCategoryID INT,
    @DeliveryMethodID INT,
    @PhoneNumber NVARCHAR(20) = NULL,
    @WebsiteURL NVARCHAR(256) = NULL,
    @PaymentDays INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
 
        IF NOT EXISTS (SELECT 1 FROM Syn.Customers WHERE CustomerID = @CustomerID)
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50001, 'El cliente no existe.', 1;
        END
 
        UPDATE Syn.Customers
        SET CustomerName = @CustomerName,
            CustomerCategoryID = @CustomerCategoryID,
            DeliveryMethodID = @DeliveryMethodID,
            PhoneNumber = @PhoneNumber,
            WebsiteURL = @WebsiteURL,
            PaymentDays = @PaymentDays,
            LastEditedBy = (SELECT MIN(PersonID) FROM Syn.People)
        WHERE CustomerID = @CustomerID;
 
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
 
-- ============================================
-- CLIENTES: Eliminar
-- ============================================
CREATE OR ALTER PROCEDURE Api.usp_Clientes_Eliminar
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
 
        IF NOT EXISTS (SELECT 1 FROM Syn.Customers WHERE CustomerID = @CustomerID)
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50002, 'El cliente no existe.', 1;
        END
 
        DELETE FROM Syn.Customers WHERE CustomerID = @CustomerID;
 
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

