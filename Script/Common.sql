USE WideWorldImporters;
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

CREATE OR ALTER PROCEDURE Api.usp_Ciudades_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CityID, CityName
    FROM Syn.Cities
    WHERE LatestRecordedPopulation IS NOT NULL
    ORDER BY CityName;
END
GO

CREATE OR ALTER PROCEDURE Api.usp_Personas_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT PersonID, FullName
    FROM Syn.People
    WHERE IsEmployee = 0
    ORDER BY FullName;
END
GO