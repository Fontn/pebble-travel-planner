#include <pebble.h>

#include "trafik.h"


app_trip_list trip_list;

bool is_digit(char character) {
  if( character >= '0' && character <= '9' ){
    return true;
  } else {
    return false;
  }
}

void clear_triplist() {
  for (int i = 0; i < NUMBER_OF_TRIPS; i++) {
    for (int j = 0; j < NUMBER_OF_LEGS_PER_TRIP; j++) {
      trip_list.trip[i].leg[j].name[0] = '\0';
      trip_list.trip[i].leg[j].track[0] = '\0';
      trip_list.trip[i].leg[j].origin_time[0] = '\0';
      trip_list.trip[i].leg[j].destination[0] = '\0';
      trip_list.trip[i].leg[j].destination_time[0] = '\0';
    }
  }
}

void parse_and_store_tsv(char* tsv) {
  if (!is_digit(tsv[0])) {
    return;
  }
  int trip = -1;
  int leg = 0;
  int column = 0;
  int index_in_value = 0;

  clear_triplist();

  for (int i = 0; tsv[i]; i++) {
    if (tsv[i] == '\t') {
      column++;
      index_in_value = 0;
      continue;
    }
    if (tsv[i] == '\n') {
      leg++;
      column = 0;
      index_in_value = 0;
      continue;
    }
    if (column == 0 && is_digit(tsv[i])) {
      int trip_index = tsv[i] - '0';
      trip++;
      trip_list.trip[trip].id[0] = tsv[i];
      trip_list.trip[trip].id[1] = '\0';
      leg = 0;
      continue;
    }
    if (column == 1 && index_in_value <= 2) {
      trip_list.trip[trip].leg[leg].name[index_in_value] = tsv[i];
      trip_list.trip[trip].leg[leg].name[index_in_value + 1] = '\0';
    }
    if (column == 2 && index_in_value <= 2) {
      trip_list.trip[trip].leg[leg].track[index_in_value] = tsv[i];
      trip_list.trip[trip].leg[leg].track[index_in_value + 1] = '\0';
    }
    if (column == 3 && index_in_value <= 4) {
      trip_list.trip[trip].leg[leg].origin_time[index_in_value] = tsv[i];
      trip_list.trip[trip].leg[leg].origin_time[index_in_value + 1] = '\0';
    }
    if (column == 4 && index_in_value <= 8) {
      trip_list.trip[trip].leg[leg].destination[index_in_value] = tsv[i];
      trip_list.trip[trip].leg[leg].destination[index_in_value + 1] = '\0';
    }
    if (column == 5 && index_in_value <= 4) {
      trip_list.trip[trip].leg[leg].destination_time[index_in_value] = tsv[i];
      trip_list.trip[trip].leg[leg].destination_time[index_in_value + 1] = '\0';
    }
    index_in_value++;
  }

  for (int i = 0; i < NUMBER_OF_TRIPS; i++) {
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "Trip: %s", trip_list.trip[i].id);
    for (int j = 0; j < NUMBER_OF_LEGS_PER_TRIP; j++) {
      //APP_LOG(APP_LOG_LEVEL_DEBUG, " name:%s,track:%s,otime:%s,dest:%s,dtime:%s", trip_list.trip[i].leg[j].name, trip_list.trip[i].leg[j].track, trip_list.trip[i].leg[j].origin_time, trip_list.trip[i].leg[j].destination, trip_list.trip[i].leg[j].destination_time);
    }
  }
}
