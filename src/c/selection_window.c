#include <pebble.h>

#include "trafik.h"

static Window *s_window;
static MenuLayer *s_menu_layer;

uint32_t message_key;
app_settings settings;

static uint16_t get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *context) {
  return 8;
}

static void draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *context) {
    menu_cell_basic_draw(ctx, cell_layer, settings.location[cell_index->row], settings.name[cell_index->row], NULL);
}

static void store_selection(int row) {
  if (message_key == MESSAGE_KEY_oSelection) {
    settings.oSelection = row;
    persist_write_int(MESSAGE_KEY_oSelection, settings.oSelection);
  } else if (message_key == MESSAGE_KEY_dSelection) {
    settings.dSelection = row;
    persist_write_int(MESSAGE_KEY_dSelection, settings.dSelection);
  }
}

static void send_selection(int row, uint32_t msg_key) {
  DictionaryIterator *out_iter;
  AppMessageResult result = app_message_outbox_begin(&out_iter);
  if(result == APP_MSG_OK) {
    dict_write_int(out_iter, msg_key, &row, sizeof(int), true);
    result = app_message_outbox_send();
    if(result != APP_MSG_OK) {
      APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
    }
  } else {
    // The outbox cannot be used right now
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing the outbox: %d", (int)result);
  }
}

static void select_callback(struct MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  if (settings.location[cell_index->row])
  store_selection(cell_index->row);
  send_selection(cell_index->row, message_key);
  window_stack_remove(s_window, true);
}

static void set_selected_index_to_settings() {
  MenuIndex cell_index;
  cell_index.section = 0;
  if (message_key == MESSAGE_KEY_oSelection) {
    cell_index.row = (uint16_t) settings.oSelection;
  } else if (message_key == MESSAGE_KEY_dSelection) {
    cell_index.row = (uint16_t) settings.dSelection;
  }
    menu_layer_set_selected_index(s_menu_layer, cell_index, MenuRowAlignCenter, false);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_menu_layer = menu_layer_create(bounds);
  menu_layer_set_click_config_onto_window(s_menu_layer, window);
  menu_layer_set_callbacks(s_menu_layer, NULL, (MenuLayerCallbacks) {
      .get_num_rows = get_num_rows_callback,
      .draw_row = draw_row_callback,
      .select_click = select_callback,
  });
  set_selected_index_to_settings();
  layer_add_child(window_layer, menu_layer_get_layer(s_menu_layer));
}

static void window_unload(Window *window) {
  menu_layer_destroy(s_menu_layer);
  window_destroy(window);
  s_window = NULL;
}

void selection_window_push(int msg_key) {
  message_key = msg_key;
  if(!s_window) {
    s_window = window_create();
    window_set_window_handlers(s_window, (WindowHandlers) {
        .load = window_load,
        .unload = window_unload,
    });
  }
  window_stack_push(s_window, true);
}
