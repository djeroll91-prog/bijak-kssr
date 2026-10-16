package my.bijakkssr.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Shell Android untuk aplikasi luar talian Bijak KSSR.
 *
 * Fail web dimuatkan daripada folder assets/www melalui pemuat sumber tersuai
 * pada hos maya https://appassets.androidplatform.net, jadi laluan mutlak
 * (cth. "/assets/index.js") dan pendaftaran service worker kedua-duanya
 * berfungsi seperti di web biasa — walaupun tanpa sambungan internet.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String URL_ROOT = "https://" + HOST + "/";
    private static final String ASSET_ROOT = "www";

    private static final Map<String, String> MIME = new HashMap<>();
    static {
        MIME.put("html", "text/html");
        MIME.put("js", "application/javascript");
        MIME.put("mjs", "application/javascript");
        MIME.put("css", "text/css");
        MIME.put("json", "application/json");
        MIME.put("webmanifest", "application/manifest+json");
        MIME.put("svg", "image/svg+xml");
        MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg");
        MIME.put("jpeg", "image/jpeg");
        MIME.put("gif", "image/gif");
        MIME.put("webp", "image/webp");
        MIME.put("ico", "image/x-icon");
        MIME.put("woff", "font/woff");
        MIME.put("woff2", "font/woff2");
        MIME.put("ttf", "font/ttf");
        MIME.put("mp3", "audio/mpeg");
        MIME.put("wav", "audio/wav");
        MIME.put("ogg", "audio/ogg");
        MIME.put("txt", "text/plain");
    }

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        webView.setBackgroundColor(0xFFFFF7ED);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        // Benarkan kesan bunyi dimainkan tanpa sentuhan berulang.
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setWebViewClient(new AssetClient());
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(webView);

        webView.loadUrl(URL_ROOT + "index.html");
    }

    /** Menyajikan fail daripada assets/www untuk hos maya. */
    private class AssetClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            if (!url.startsWith(URL_ROOT)) return null;

            String path = url.substring(URL_ROOT.length());
            int hash = path.indexOf('#');
            if (hash >= 0) path = path.substring(0, hash);
            int query = path.indexOf('?');
            if (query >= 0) path = path.substring(0, query);
            if (path.isEmpty() || path.endsWith("/")) path = path + "index.html";

            String assetPath = ASSET_ROOT + "/" + path;
            String ext = "";
            int dot = path.lastIndexOf('.');
            if (dot >= 0) ext = path.substring(dot + 1).toLowerCase(Locale.US);

            try {
                InputStream in = getAssets().open(assetPath);
                String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
                Map<String, String> headers = new HashMap<>();
                headers.put("Cache-Control", "no-cache");
                return new WebResourceResponse(mime, "UTF-8", 200, "OK", headers, in);
            } catch (IOException e) {
                // Fail tidak dijumpai — biarkan WebView menanganinya.
                return null;
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
