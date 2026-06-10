package com.medhome.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MedHome";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "MainActivity onCreate - App starting");
    }

    @Override
    public void onStart() {
        super.onStart();
        Log.d(TAG, "MainActivity onStart");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "MainActivity onResume");
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d(TAG, "MainActivity onPause");
    }

    @Override
    public void onStop() {
        super.onStop();
        Log.d(TAG, "MainActivity onStop");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "MainActivity onDestroy");
    }
}
