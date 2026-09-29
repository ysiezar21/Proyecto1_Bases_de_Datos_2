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

CREATE OR ALTER PROCEDURE Api.usp_Proveedores_Categorias
AS
BEGIN
    SET NOCOUNT ON;
    SELECT SupplierCategoryID, SupplierCategoryName
    FROM Syn.SupplierCategories
    ORDER BY SupplierCategoryName;
END
GO

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

CREATE OR ALTER PROCEDURE Api.usp_Proveedores_Crear
    @SupplierName NVARCHAR(100),
    @SupplierCategoryID INT,
    @DeliveryMethodID INT,
    @DeliveryCityID INT,
    @PrimaryContactPersonID INT,
    @PhoneNumber NVARCHAR(20) = NULL,
    @WebsiteURL NVARCHAR(256) = NULL,
    @NuevoSupplierID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @SistemaPersonID INT = (SELECT MIN(PersonID) FROM Syn.People);
        DECLARE @NextID INT = (SELECT ISNULL(MAX(SupplierID), 0) + 1 FROM Syn.Suppliers);

        INSERT INTO Syn.Suppliers (
            SupplierID,
            SupplierName,
            SupplierCategoryID,
            PrimaryContactPersonID,
            AlternateContactPersonID,
            DeliveryMethodID,
            DeliveryCityID,
            PostalCityID,
            PaymentDays,
            PhoneNumber,
            FaxNumber,
            WebsiteURL,
            DeliveryAddressLine1,
            DeliveryPostalCode,
            PostalAddressLine1,
            PostalPostalCode,
            LastEditedBy
        )
        VALUES (
            @NextID,
            @SupplierName,
            @SupplierCategoryID,
            @PrimaryContactPersonID,
            @PrimaryContactPersonID,
            @DeliveryMethodID,
            @DeliveryCityID,
            @DeliveryCityID,
            30,
            @PhoneNumber,
            'N/A',
            @WebsiteURL,
            'Sin direccion',
            '00000',
            'Sin direccion',
            '00000',
            @SistemaPersonID
        );

        SET @NuevoSupplierID = @NextID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE Api.usp_Proveedores_Modificar
    @SupplierID INT,
    @SupplierName NVARCHAR(100),
    @SupplierCategoryID INT,
    @DeliveryMethodID INT,
    @PhoneNumber NVARCHAR(20) = NULL,
    @WebsiteURL NVARCHAR(256) = NULL,
    @PaymentDays INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM Syn.Suppliers WHERE SupplierID = @SupplierID)
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50003, 'El proveedor no existe.', 1;
        END

        UPDATE Syn.Suppliers
        SET SupplierName = @SupplierName,
            SupplierCategoryID = @SupplierCategoryID,
            DeliveryMethodID = @DeliveryMethodID,
            PhoneNumber = @PhoneNumber,
            WebsiteURL = @WebsiteURL,
            PaymentDays = @PaymentDays,
            LastEditedBy = (SELECT MIN(PersonID) FROM Syn.People)
        WHERE SupplierID = @SupplierID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE Api.usp_Proveedores_Eliminar
    @SupplierID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM Syn.Suppliers WHERE SupplierID = @SupplierID)
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50004, 'El proveedor no existe.', 1;
        END

        DELETE FROM Syn.Suppliers WHERE SupplierID = @SupplierID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
