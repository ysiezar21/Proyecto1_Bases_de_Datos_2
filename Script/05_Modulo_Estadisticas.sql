USE WideWorldImporters;
GO

/* ============================================================
   PROCEDURES DE ESTADÍSTICAS
   ============================================================ */

-- Reporte 1: montos de compras por categoría y proveedor con ROLLUP
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_ComprasProveedores
    @Categoria NVARCHAR(100) = NULL,
    @Proveedor NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CASE WHEN GROUPING(sc.SupplierCategoryName) = 1 THEN 'Total general'
             ELSE sc.SupplierCategoryName END AS Categoria,
        CASE WHEN GROUPING(sc.SupplierCategoryName) = 1 THEN NULL
             WHEN GROUPING(s.SupplierName) = 1 THEN 'Total de la categoría'
             ELSE s.SupplierName END AS Proveedor,
        MAX(m.Monto) AS MontoMaximo,
        MIN(m.Monto) AS MontoMinimo,
        CAST(AVG(m.Monto) AS DECIMAL(18,2)) AS MontoPromedio,
        GROUPING(sc.SupplierCategoryName) + GROUPING(s.SupplierName) AS Nivel
    FROM Syn.PurchaseOrders po
    INNER JOIN (
        SELECT PurchaseOrderID, SUM(OrderedOuters * ExpectedUnitPricePerOuter) AS Monto
        FROM Syn.PurchaseOrderLines
        GROUP BY PurchaseOrderID
    ) m ON m.PurchaseOrderID = po.PurchaseOrderID
    INNER JOIN Syn.Suppliers s ON s.SupplierID = po.SupplierID
    INNER JOIN Syn.SupplierCategories sc ON sc.SupplierCategoryID = s.SupplierCategoryID
    WHERE (@Categoria IS NULL OR sc.SupplierCategoryName LIKE '%' + @Categoria + '%')
      AND (@Proveedor IS NULL OR s.SupplierName LIKE '%' + @Proveedor + '%')
    GROUP BY ROLLUP (sc.SupplierCategoryName, s.SupplierName)
    ORDER BY GROUPING(sc.SupplierCategoryName), sc.SupplierCategoryName,
             GROUPING(s.SupplierName), s.SupplierName;
END
GO

-- Reporte 2: montos de ventas por categoría y cliente con ROLLUP
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_VentasClientes
    @Categoria NVARCHAR(100) = NULL,
    @Cliente NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CASE WHEN GROUPING(cc.CustomerCategoryName) = 1 THEN 'Total general'
             ELSE cc.CustomerCategoryName END AS Categoria,
        CASE WHEN GROUPING(cc.CustomerCategoryName) = 1 THEN NULL
             WHEN GROUPING(c.CustomerName) = 1 THEN 'Total de la categoría'
             ELSE c.CustomerName END AS Cliente,
        MAX(m.Monto) AS MontoMaximo,
        MIN(m.Monto) AS MontoMinimo,
        CAST(AVG(m.Monto) AS DECIMAL(18,2)) AS MontoPromedio,
        GROUPING(cc.CustomerCategoryName) + GROUPING(c.CustomerName) AS Nivel
    FROM Syn.Invoices i
    INNER JOIN (
        SELECT InvoiceID, SUM(ExtendedPrice) AS Monto
        FROM Syn.InvoiceLines
        GROUP BY InvoiceID
    ) m ON m.InvoiceID = i.InvoiceID
    INNER JOIN Syn.Customers c ON c.CustomerID = i.CustomerID
    INNER JOIN Syn.CustomerCategories cc ON cc.CustomerCategoryID = c.CustomerCategoryID
    WHERE (@Categoria IS NULL OR cc.CustomerCategoryName LIKE '%' + @Categoria + '%')
      AND (@Cliente IS NULL OR c.CustomerName LIKE '%' + @Cliente + '%')
    GROUP BY ROLLUP (cc.CustomerCategoryName, c.CustomerName)
    ORDER BY GROUPING(cc.CustomerCategoryName), cc.CustomerCategoryName,
             GROUPING(c.CustomerName), c.CustomerName;
END
GO

-- Años válidos de ventas
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_AniosVentas
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT YEAR(InvoiceDate) AS Anio
    FROM Syn.Invoices
    ORDER BY Anio;
END
GO

-- Años válidos de compras
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_AniosCompras
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT YEAR(OrderDate) AS Anio
    FROM Syn.PurchaseOrders
    ORDER BY Anio;
END
GO

-- Reporte 3: top 5 de productos con más ganancia por año con DENSE_RANK
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_TopProductos
    @AnioDesde INT = NULL,
    @AnioHasta INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT r.Anio, r.Posicion, si.StockItemName AS Producto, r.Ganancia
    FROM (
        SELECT g.Anio, g.StockItemID, g.Ganancia,
               DENSE_RANK() OVER (PARTITION BY g.Anio ORDER BY g.Ganancia DESC) AS Posicion
        FROM (
            SELECT YEAR(i.InvoiceDate) AS Anio, il.StockItemID, SUM(il.LineProfit) AS Ganancia
            FROM Syn.InvoiceLines il
            INNER JOIN Syn.Invoices i ON i.InvoiceID = il.InvoiceID
            WHERE (@AnioDesde IS NULL OR YEAR(i.InvoiceDate) >= @AnioDesde)
              AND (@AnioHasta IS NULL OR YEAR(i.InvoiceDate) <= @AnioHasta)
            GROUP BY YEAR(i.InvoiceDate), il.StockItemID
        ) g
    ) r
    INNER JOIN Syn.StockItems si ON si.StockItemID = r.StockItemID
    WHERE r.Posicion <= 5
    ORDER BY r.Anio, r.Posicion, si.StockItemName;
END
GO

-- Reporte 4: top 5 de clientes con más facturas por año con DENSE_RANK
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_TopClientes
    @AnioDesde INT = NULL,
    @AnioHasta INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT r.Anio, r.Posicion, c.CustomerName AS Cliente, r.CantidadFacturas, r.MontoTotal
    FROM (
        SELECT g.Anio, g.CustomerID, g.CantidadFacturas, g.MontoTotal,
               DENSE_RANK() OVER (PARTITION BY g.Anio ORDER BY g.CantidadFacturas DESC, g.MontoTotal DESC) AS Posicion
        FROM (
            SELECT YEAR(i.InvoiceDate) AS Anio, i.CustomerID,
                   COUNT(*) AS CantidadFacturas, SUM(m.Monto) AS MontoTotal
            FROM Syn.Invoices i
            INNER JOIN (
                SELECT InvoiceID, SUM(ExtendedPrice) AS Monto
                FROM Syn.InvoiceLines
                GROUP BY InvoiceID
            ) m ON m.InvoiceID = i.InvoiceID
            WHERE (@AnioDesde IS NULL OR YEAR(i.InvoiceDate) >= @AnioDesde)
              AND (@AnioHasta IS NULL OR YEAR(i.InvoiceDate) <= @AnioHasta)
            GROUP BY YEAR(i.InvoiceDate), i.CustomerID
        ) g
    ) r
    INNER JOIN Syn.Customers c ON c.CustomerID = r.CustomerID
    WHERE r.Posicion <= 5
    ORDER BY r.Anio, r.Posicion, c.CustomerName;
END
GO

-- Reporte 5: top 5 de proveedores con más órdenes de compra por año con DENSE_RANK
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_TopProveedores
    @AnioDesde INT = NULL,
    @AnioHasta INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT r.Anio, r.Posicion, s.SupplierName AS Proveedor, r.CantidadOrdenes, r.MontoTotal
    FROM (
        SELECT g.Anio, g.SupplierID, g.CantidadOrdenes, g.MontoTotal,
               DENSE_RANK() OVER (PARTITION BY g.Anio ORDER BY g.CantidadOrdenes DESC, g.MontoTotal DESC) AS Posicion
        FROM (
            SELECT YEAR(po.OrderDate) AS Anio, po.SupplierID,
                   COUNT(*) AS CantidadOrdenes, SUM(m.Monto) AS MontoTotal
            FROM Syn.PurchaseOrders po
            INNER JOIN (
                SELECT PurchaseOrderID, SUM(OrderedOuters * ExpectedUnitPricePerOuter) AS Monto
                FROM Syn.PurchaseOrderLines
                GROUP BY PurchaseOrderID
            ) m ON m.PurchaseOrderID = po.PurchaseOrderID
            WHERE (@AnioDesde IS NULL OR YEAR(po.OrderDate) >= @AnioDesde)
              AND (@AnioHasta IS NULL OR YEAR(po.OrderDate) <= @AnioHasta)
            GROUP BY YEAR(po.OrderDate), po.SupplierID
        ) g
    ) r
    INNER JOIN Syn.Suppliers s ON s.SupplierID = r.SupplierID
    WHERE r.Posicion <= 5
    ORDER BY r.Anio, r.Posicion, s.SupplierName;
END
GO

-- Reporte 6: matriz de ventas por categoría de producto y año
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_MatrizVentas
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sg.StockGroupName AS Categoria,
        SUM(CASE WHEN v.Anio = 2013 THEN v.Monto ELSE 0 END) AS [2013],
        SUM(CASE WHEN v.Anio = 2014 THEN v.Monto ELSE 0 END) AS [2014],
        SUM(CASE WHEN v.Anio = 2015 THEN v.Monto ELSE 0 END) AS [2015],
        SUM(CASE WHEN v.Anio = 2016 THEN v.Monto ELSE 0 END) AS [2016],
        SUM(v.Monto) AS Total
    FROM (
        SELECT il.StockItemID, YEAR(i.InvoiceDate) AS Anio, SUM(il.ExtendedPrice) AS Monto
        FROM Syn.InvoiceLines il
        INNER JOIN Syn.Invoices i ON i.InvoiceID = il.InvoiceID
        GROUP BY il.StockItemID, YEAR(i.InvoiceDate)
    ) v
    INNER JOIN Syn.StockItemStockGroups sisg ON sisg.StockItemID = v.StockItemID
    INNER JOIN Syn.StockGroups sg ON sg.StockGroupID = sisg.StockGroupID
    GROUP BY sg.StockGroupName
    ORDER BY sg.StockGroupName;
END
GO

-- Productos para el filtro de subcategoría, opcionalmente por grupo
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_Productos
    @StockGroupID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT si.StockItemID, si.StockItemName
    FROM Syn.StockItems si
    WHERE @StockGroupID IS NULL
       OR EXISTS (SELECT 1 FROM Syn.StockItemStockGroups sg
                  WHERE sg.StockItemID = si.StockItemID AND sg.StockGroupID = @StockGroupID)
    ORDER BY si.StockItemName;
END
GO

-- Reporte 7: seguimiento mensual de compras de clientes con paginación
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_SeguimientoClientes
    @Anio INT = NULL,
    @Mes INT = NULL,
    @StockGroupID INT = NULL,
    @StockItemID INT = NULL,
    @Pagina INT = 1,
    @TamanoPagina INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @Pagina < 1 SET @Pagina = 1;
    IF @TamanoPagina < 1 SET @TamanoPagina = 50;

    SELECT
        c.CustomerName AS Cliente,
        g.Anio,
        g.Mes,
        g.MontoTotal,
        CONVERT(VARCHAR(10), g.PrimeraFactura, 23) AS PrimeraFactura,
        CONVERT(VARCHAR(10), g.UltimaFactura, 23) AS UltimaFactura,
        g.CantidadTotal,
        g.CantidadMinima,
        g.CantidadMaxima,
        COUNT(*) OVER() AS TotalRegistros
    FROM (
        SELECT i.CustomerID,
               YEAR(i.InvoiceDate) AS Anio,
               MONTH(i.InvoiceDate) AS Mes,
               SUM(il.ExtendedPrice) AS MontoTotal,
               MIN(i.InvoiceDate) AS PrimeraFactura,
               MAX(i.InvoiceDate) AS UltimaFactura,
               SUM(il.Quantity) AS CantidadTotal,
               MIN(il.Quantity) AS CantidadMinima,
               MAX(il.Quantity) AS CantidadMaxima
        FROM Syn.InvoiceLines il
        INNER JOIN Syn.Invoices i ON i.InvoiceID = il.InvoiceID
        WHERE (@Anio IS NULL OR YEAR(i.InvoiceDate) = @Anio)
          AND (@Mes IS NULL OR MONTH(i.InvoiceDate) = @Mes)
          AND (@StockItemID IS NULL OR il.StockItemID = @StockItemID)
          AND (@StockGroupID IS NULL OR EXISTS (
                SELECT 1 FROM Syn.StockItemStockGroups sg
                WHERE sg.StockItemID = il.StockItemID AND sg.StockGroupID = @StockGroupID))
        GROUP BY i.CustomerID, YEAR(i.InvoiceDate), MONTH(i.InvoiceDate)
    ) g
    INNER JOIN Syn.Customers c ON c.CustomerID = g.CustomerID
    ORDER BY c.CustomerName, g.CustomerID, g.Anio, g.Mes
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH NEXT @TamanoPagina ROWS ONLY;
END
GO

-- Reporte 8: seguimiento mensual de compras a proveedores con paginación
CREATE OR ALTER PROCEDURE Api.usp_Estadisticas_SeguimientoProveedores
    @Anio INT = NULL,
    @Mes INT = NULL,
    @StockGroupID INT = NULL,
    @StockItemID INT = NULL,
    @Pagina INT = 1,
    @TamanoPagina INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @Pagina < 1 SET @Pagina = 1;
    IF @TamanoPagina < 1 SET @TamanoPagina = 50;

    SELECT
        s.SupplierName AS Proveedor,
        g.Anio,
        g.Mes,
        g.MontoTotal,
        CONVERT(VARCHAR(10), g.PrimeraOrden, 23) AS PrimeraOrden,
        CONVERT(VARCHAR(10), g.UltimaOrden, 23) AS UltimaOrden,
        g.CantidadTotal,
        g.CantidadMinima,
        g.CantidadMaxima,
        COUNT(*) OVER() AS TotalRegistros
    FROM (
        SELECT po.SupplierID,
               YEAR(po.OrderDate) AS Anio,
               MONTH(po.OrderDate) AS Mes,
               SUM(pol.OrderedOuters * pol.ExpectedUnitPricePerOuter) AS MontoTotal,
               MIN(po.OrderDate) AS PrimeraOrden,
               MAX(po.OrderDate) AS UltimaOrden,
               SUM(pol.OrderedOuters) AS CantidadTotal,
               MIN(pol.OrderedOuters) AS CantidadMinima,
               MAX(pol.OrderedOuters) AS CantidadMaxima
        FROM Syn.PurchaseOrderLines pol
        INNER JOIN Syn.PurchaseOrders po ON po.PurchaseOrderID = pol.PurchaseOrderID
        WHERE (@Anio IS NULL OR YEAR(po.OrderDate) = @Anio)
          AND (@Mes IS NULL OR MONTH(po.OrderDate) = @Mes)
          AND (@StockItemID IS NULL OR pol.StockItemID = @StockItemID)
          AND (@StockGroupID IS NULL OR EXISTS (
                SELECT 1 FROM Syn.StockItemStockGroups sg
                WHERE sg.StockItemID = pol.StockItemID AND sg.StockGroupID = @StockGroupID))
        GROUP BY po.SupplierID, YEAR(po.OrderDate), MONTH(po.OrderDate)
    ) g
    INNER JOIN Syn.Suppliers s ON s.SupplierID = g.SupplierID
    ORDER BY s.SupplierName, g.SupplierID, g.Anio, g.Mes
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH NEXT @TamanoPagina ROWS ONLY;
END
GO