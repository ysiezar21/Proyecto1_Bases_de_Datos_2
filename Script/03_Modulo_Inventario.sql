USE WideWorldImporters;
GO

/* ============================================================
   SINÓNIMOS PARA INVENTARIO
   ============================================================ */

IF OBJECT_ID('Syn.StockItems', 'SN') IS NOT NULL DROP SYNONYM Syn.StockItems;
CREATE SYNONYM Syn.StockItems FOR Warehouse.StockItems;
GO

IF OBJECT_ID('Syn.StockGroups', 'SN') IS NOT NULL DROP SYNONYM Syn.StockGroups;
CREATE SYNONYM Syn.StockGroups FOR Warehouse.StockGroups;
GO

IF OBJECT_ID('Syn.StockItemStockGroups', 'SN') IS NOT NULL DROP SYNONYM Syn.StockItemStockGroups;
CREATE SYNONYM Syn.StockItemStockGroups FOR Warehouse.StockItemStockGroups;
GO

IF OBJECT_ID('Syn.StockItemHoldings', 'SN') IS NOT NULL DROP SYNONYM Syn.StockItemHoldings;
CREATE SYNONYM Syn.StockItemHoldings FOR Warehouse.StockItemHoldings;
GO

IF OBJECT_ID('Syn.Colors', 'SN') IS NOT NULL DROP SYNONYM Syn.Colors;
CREATE SYNONYM Syn.Colors FOR Warehouse.Colors;
GO

IF OBJECT_ID('Syn.PackageTypes', 'SN') IS NOT NULL DROP SYNONYM Syn.PackageTypes;
CREATE SYNONYM Syn.PackageTypes FOR Warehouse.PackageTypes;
GO


/* ============================================================
   PROCEDURES DE INVENTARIO
   ============================================================ */

-- Listar grupos de productos
CREATE OR ALTER PROCEDURE Api.usp_Inventario_Grupos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT StockGroupID, StockGroupName
    FROM Syn.StockGroups
    ORDER BY StockGroupName;
END
GO


-- Listar productos con filtros acumulativos
CREATE OR ALTER PROCEDURE Api.usp_Inventario_Listar
    @Nombre NVARCHAR(100) = NULL,
    @StockGroupID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        si.StockItemID,
        si.StockItemName AS Nombre,
        STUFF((
            SELECT ', ' + sg.StockGroupName
            FROM Syn.StockItemStockGroups sisg
            INNER JOIN Syn.StockGroups sg ON sg.StockGroupID = sisg.StockGroupID
            WHERE sisg.StockItemID = si.StockItemID
            FOR XML PATH('')
        ), 1, 2, '') AS Grupo,
        ISNULL(sih.QuantityOnHand, 0) AS CantidadInventario
    FROM Syn.StockItems si
    LEFT JOIN Syn.StockItemHoldings sih ON sih.StockItemID = si.StockItemID
    WHERE (@Nombre IS NULL OR si.StockItemName LIKE '%' + @Nombre + '%')
      AND (@StockGroupID IS NULL OR EXISTS (
          SELECT 1
          FROM Syn.StockItemStockGroups sisg2
          WHERE sisg2.StockItemID = si.StockItemID
            AND sisg2.StockGroupID = @StockGroupID
      ))
    ORDER BY si.StockItemName ASC;
END
GO


-- Detalle completo del producto
CREATE OR ALTER PROCEDURE Api.usp_Inventario_Detalle
    @StockItemID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        si.StockItemID,
        si.StockItemName AS Nombre,
        si.SupplierID,
        sup.SupplierName AS NombreProveedor,
        col.ColorName AS Color,
        upt.PackageTypeName AS UnidadEmpaque,
        opt.PackageTypeName AS EmpaqueExterior,
        si.QuantityPerOuter AS CantidadEmpaque,
        si.Brand AS Marca,
        si.Size AS Talla,
        si.TaxRate AS Impuesto,
        si.UnitPrice AS PrecioUnitario,
        si.RecommendedRetailPrice AS PrecioVenta,
        si.TypicalWeightPerUnit AS Peso,
        si.SearchDetails AS PalabrasClaves,
        ISNULL(sih.QuantityOnHand, 0) AS CantidadDisponible,
        sih.BinLocation AS Ubicacion
    FROM Syn.StockItems si
    LEFT JOIN Syn.Suppliers sup ON sup.SupplierID = si.SupplierID
    LEFT JOIN Syn.Colors col ON col.ColorID = si.ColorID
    LEFT JOIN Syn.PackageTypes upt ON upt.PackageTypeID = si.UnitPackageID
    LEFT JOIN Syn.PackageTypes opt ON opt.PackageTypeID = si.OuterPackageID
    LEFT JOIN Syn.StockItemHoldings sih ON sih.StockItemID = si.StockItemID
    WHERE si.StockItemID = @StockItemID;
END
GO