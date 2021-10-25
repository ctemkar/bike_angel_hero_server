USE `bike_angel_hero_mdb`;
DROP PROCEDURE IF EXISTS ComboWithOptions;
DELIMITER ;;
CREATE DEFINER=`bikeangelhero`@`%` PROCEDURE `ComboWithOptions`(
	IN lat DECIMAL(11, 8),
	IN lon DECIMAL(11, 8),
	IN sortorder INT	
)
BEGIN

SET @select = CONCAT("select b.bike_angels_points + c.bike_angels_points as angel_points, a.google_distance, google_walking_time walking_time, stationname pickup_from,",
	 "`stationnamenear` dropoff_to, a.latitude, a.longitude ");
SET @from = " from stations_near a inner join stations_current b ON a.stationid = b.stationid inner join stations_current c ON a.stationid_near = c.stationid";
SET @where = CONCAT(" where b.`bike_angels_action` = 'take' AND c.`bike_angels_action` = 'give' ",
	" and c.`bike_angels_points` is not null",
	" and `google_distance` is not null ");
SET @orderby = " order by angel_points DESC, `walking_time` ASC ";
SET @limit = " LIMIT 300 ";
SET @nearDistance = "3";


IF lat IS NOT NULL AND lon IS NOT NULL THEN
SET @where = CONCAT(@where, 
     " AND (3959 * acos (",
     " cos ( radians(", lat, ") ) ",
     " * cos( radians( a.latitude ) ) ",
     " * cos( radians( ", lon, " ) - radians(a.longitude) ) ", 
     " + sin ( radians(a.latitude) ) ",
     " * sin( radians( ", lat, " ) ))) < ",
      @nearDistance);
END IF;

IF sortorder = 1 THEN 
	SET @orderby = " order by walking_time ASC,  angel_points DESC ";
END IF;


SET @query = CONCAT(@select, @from, @where, @orderby,  @limit);
-- SELECT @query;
 PREPARE stmt FROM @query;
 	EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
END;;
DELIMITER ;
call ComboWithOptions(40.760840, -73.998760, 0);