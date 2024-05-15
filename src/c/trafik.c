#include <pebble.h>

#include "trafik.h"
#include "selection_window.h"
#include "trip_list.h"
#include "detailed_trip_list_view.h"

static Window *s_window;

static bool s_js_ready;

app_settings settings;
app_trip_list trip_list;

bool comm_is_js_ready() {
  return s_js_ready;
}

static void location_settings_received_handler(DictionaryIterator *iter, void *context) {
  for (int i = 0; i < 8; i++) {
    Tuple *location_tuple = dict_find(iter, MESSAGE_KEY_location + i);
    Tuple *name_tuple = dict_find(iter, MESSAGE_KEY_name + i);
    if(name_tuple) {
      char *name = name_tuple->value->cstring;
      snprintf(settings.name[i], sizeof(settings.name[i]), "%s", name);
      persist_write_string(MESSAGE_KEY_name + i, settings.name[i]);
      APP_LOG(APP_LOG_LEVEL_DEBUG, settings.name[i]);
    }
    if(location_tuple) {
      char *location = location_tuple->value->cstring;
      snprintf(settings.location[i], sizeof(settings.location[i]), "%s", location);
      persist_write_string(MESSAGE_KEY_location + i, settings.location[i]);
      APP_LOG(APP_LOG_LEVEL_DEBUG, settings.location[i]);
    }
  }
}

static void send_watch_controlled_settings() {
  DictionaryIterator *out_iter;
  AppMessageResult result = app_message_outbox_begin(&out_iter);
  if(result == APP_MSG_OK) {
    dict_write_int(out_iter, MESSAGE_KEY_oSelection, &settings.oSelection, sizeof(int32_t), true);
    dict_write_int(out_iter, MESSAGE_KEY_dSelection, &settings.dSelection, sizeof(int32_t), true);
    result = app_message_outbox_send();
    if(result != APP_MSG_OK) {
      APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
    }
  } else {
    // The outbox cannot be used right now
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing the outbox: %d", (int)result);
  }
}

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *ready_tuple = dict_find(iter, MESSAGE_KEY_JSReady);
  Tuple *trip_list_TSV_tuple = dict_find(iter, MESSAGE_KEY_tripListTSV);

  if(ready_tuple) {
    // PebbleKit JS is ready! Safe to send messages
    s_js_ready = true;

    // Send the Settings that are changeable by the watch (so far only origin and destination selections)
    send_watch_controlled_settings();
  }

  if(trip_list_TSV_tuple) {
    parse_and_store_tsv(trip_list_TSV_tuple->value->cstring);
    display_detailed_trip_list(-1);
    //update_trip_list_times();
  }

  // Handles location + location name
  location_settings_received_handler(iter, context);
}

static void prv_select_click_handler(ClickRecognizerRef recognizer, void *context) {
}

static void prv_up_click_handler(ClickRecognizerRef recognizer, void *context) {
  selection_window_push(MESSAGE_KEY_oSelection);
}

static void prv_down_click_handler(ClickRecognizerRef recognizer, void *context) {
  selection_window_push(MESSAGE_KEY_dSelection);
}

static void prv_click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, prv_select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, prv_up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, prv_down_click_handler);
}

static void prv_window_load(Window *window) {
  init_detailed_trip_list_text_layers(window);
}

static void prv_window_unload(Window *window) {
  destroy_detailed_trip_list_text_layers();
}

static void prv_init(void) {
  s_window = window_create();
  window_set_background_color(s_window, GColorBlack);
  window_set_click_config_provider(s_window, prv_click_config_provider);
  window_set_window_handlers(s_window, (WindowHandlers) {
    .load = prv_window_load,
    .unload = prv_window_unload,
  });
  const bool animated = true;
  window_stack_push(s_window, animated);

  app_message_register_inbox_received(inbox_received_handler);
  app_message_open(1028, 512);
}

static void prv_deinit(void) {
  window_destroy(s_window);
}

static void load_presist_settings() {
  for (int i = 0; i < 8; i++) {
    persist_read_string(MESSAGE_KEY_location + i, settings.location[i], sizeof(settings.location[i]));
    persist_read_string(MESSAGE_KEY_name + i, settings.name[i], sizeof(settings.name[i]));
  }
  settings.oSelection = persist_read_int(MESSAGE_KEY_oSelection);
  settings.dSelection = persist_read_int(MESSAGE_KEY_dSelection);
}

int main(void) {
  prv_init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", s_window);

  load_presist_settings();

  app_event_loop();
  prv_deinit();
}
