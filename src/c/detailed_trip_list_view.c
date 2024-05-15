#include <pebble.h>

#include "trafik.h"
#include "selection_window.h"
#include "trip_list.h"
#include "detailed_trip_list_view.h"

static TextLayer *s_trip_list_text_layer_matrix[NUMBER_OF_TRIP_LIST_COLUMNS][NUMBER_OF_TRIP_LIST_ROWS];

app_trip_list trip_list;

void display_detailed_trip_list(int selection) {
  int row = 0;
  for (int i = 0; i < NUMBER_OF_TRIPS; i++) {
    if (i == selection) {
      text_layer_set_text(s_trip_list_text_layer_matrix[0][row], "*");
    } else {
      text_layer_set_text(s_trip_list_text_layer_matrix[0][row], trip_list.trip[i].id);
    }
    for (int j = 0; j < NUMBER_OF_LEGS_PER_TRIP; j++) {
      if (trip_list.trip[i].leg[j].name[0] == '\0') {
        continue;
        for (int k = 0; k < NUMBER_OF_TRIP_LIST_COLUMNS; k++) {
          text_layer_set_text(s_trip_list_text_layer_matrix[k][row], "");
        }
      }
      text_layer_set_text(s_trip_list_text_layer_matrix[1][row], trip_list.trip[i].leg[j].name);
      text_layer_set_text(s_trip_list_text_layer_matrix[2][row], trip_list.trip[i].leg[j].track);
      text_layer_set_text(s_trip_list_text_layer_matrix[3][row], trip_list.trip[i].leg[j].origin_time);
      text_layer_set_text(s_trip_list_text_layer_matrix[4][row], ">");
      text_layer_set_text(s_trip_list_text_layer_matrix[5][row], trip_list.trip[i].leg[j].destination_time);
      row = row + 1;
      if (row >= NUMBER_OF_TRIP_LIST_ROWS) {
        return;
      }
    }
  }
}

void init_detailed_trip_list_text_layers(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  for (int j = 0; j < NUMBER_OF_TRIP_LIST_ROWS; j++) {
    s_trip_list_text_layer_matrix[0][j] = text_layer_create(GRect(0, j*14, 18, 14)); // selection marker
    text_layer_set_text_alignment(s_trip_list_text_layer_matrix[0][j], GTextAlignmentRight);
    s_trip_list_text_layer_matrix[1][j] = text_layer_create(GRect(24, j*14, 24, 14)); // line/buss display id
    text_layer_set_text_alignment(s_trip_list_text_layer_matrix[1][j], GTextAlignmentLeft);
    s_trip_list_text_layer_matrix[2][j] = text_layer_create(GRect(48, j*14, 24, 14)); // track
    text_layer_set_text_alignment(s_trip_list_text_layer_matrix[2][j], GTextAlignmentLeft);
    text_layer_set_font(s_trip_list_text_layer_matrix[2][j], fonts_get_system_font(FONT_KEY_GOTHIC_14));
    s_trip_list_text_layer_matrix[3][j] = text_layer_create(GRect(72, j*14, 32, 14)); // start time
    text_layer_set_text_alignment(s_trip_list_text_layer_matrix[3][j], GTextAlignmentCenter);
    s_trip_list_text_layer_matrix[4][j] = text_layer_create(GRect(104, j*14, 8, 14)); // sepperator for start&end time
    text_layer_set_text_alignment(s_trip_list_text_layer_matrix[4][j], GTextAlignmentRight);
    text_layer_set_font(s_trip_list_text_layer_matrix[4][j], fonts_get_system_font(FONT_KEY_GOTHIC_14));
    s_trip_list_text_layer_matrix[5][j] = text_layer_create(GRect(112, j*14, 32, 14)); // end time
    text_layer_set_text_alignment(s_trip_list_text_layer_matrix[5][j], GTextAlignmentCenter);
  }

  for (int i = 0; i < NUMBER_OF_TRIP_LIST_COLUMNS; i++) {
    for (int j = 0; j < NUMBER_OF_TRIP_LIST_ROWS; j++) {
      text_layer_set_text_color(s_trip_list_text_layer_matrix[i][j], GColorClear);
      text_layer_set_background_color(s_trip_list_text_layer_matrix[i][j], GColorBlack);
      layer_add_child(window_layer, text_layer_get_layer(s_trip_list_text_layer_matrix[i][j]));
    }
  }
}

void destroy_detailed_trip_list_text_layers() {
  for (int i = 0; i < NUMBER_OF_TRIP_LIST_COLUMNS; i++) {
    for (int j = 0; j < NUMBER_OF_TRIP_LIST_ROWS; j++) {
      text_layer_destroy(s_trip_list_text_layer_matrix[i][j]);
    }
  }
}
