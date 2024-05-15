#define NUMBER_OF_TRIPS 4
#define NUMBER_OF_LEGS_PER_TRIP 4
#define NUMBER_OF_TRIP_LIST_COLUMNS 6
#define NUMBER_OF_TRIP_LIST_ROWS 13

typedef struct {
  char location[8][64];
  char name[8][64];
  int32_t oSelection;
  int32_t dSelection;
} app_settings;

typedef struct {
  char name[4];
  char track[4];
  char origin_time[6];
  char destination[10];
  char destination_time[6];
} app_leg;

typedef struct {
  char id[2];
  app_leg leg[5];
} app_trip;

typedef struct {
  app_trip trip[4];
} app_trip_list;
