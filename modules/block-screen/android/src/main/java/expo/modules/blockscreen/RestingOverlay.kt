package expo.modules.blockscreen

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView

/**
 * The simple native "resting" screen (S-14) drawn over a blocked app.
 *
 * - Fills the whole screen with a solid colour and swallows every touch, so the blocked app
 *   underneath cannot be used while this is showing.
 * - Shows the text and one "Go back" button. The phone's Back key does the same as the button.
 * - Colours follow the PRD palette: Day for focus, Night for sleep.
 */
@SuppressLint("ViewConstructor")
class RestingOverlay(
  context: Context,
  message: String,
  buttonLabel: String,
  night: Boolean,
  private val onGoBack: () -> Unit
) : FrameLayout(context) {

  init {
    val backgroundColor = Color.parseColor(if (night) "#0B1020" else "#F7F5EF")
    val textColor = Color.parseColor(if (night) "#E8ECF5" else "#1E2430")
    val accentColor = Color.parseColor(if (night) "#F5D76E" else "#3A7D44")
    val buttonTextColor = Color.parseColor(if (night) "#0B1020" else "#FFFFFF")

    setBackgroundColor(backgroundColor)
    // These three lines make the screen "solid": touches stop here and the Back key reaches us.
    isClickable = true
    isFocusable = true
    isFocusableInTouchMode = true

    val column = LinearLayout(context)
    column.orientation = LinearLayout.VERTICAL
    column.gravity = Gravity.CENTER
    column.setPadding(dp(32), dp(32), dp(32), dp(32))

    val messageView = TextView(context)
    messageView.text = message
    messageView.setTextColor(textColor)
    messageView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
    messageView.gravity = Gravity.CENTER

    val shape = GradientDrawable()
    shape.shape = GradientDrawable.RECTANGLE
    shape.cornerRadius = dp(24).toFloat()
    shape.setColor(accentColor)

    val button = Button(context)
    button.text = buttonLabel
    button.setAllCaps(false)
    button.setTextColor(buttonTextColor)
    button.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
    button.minimumHeight = dp(48)
    button.minHeight = dp(48)
    button.setPadding(dp(32), 0, dp(32), 0)
    button.background = shape
    button.setOnClickListener { onGoBack() }

    column.addView(
      messageView,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    )
    val buttonParams = LinearLayout.LayoutParams(
      ViewGroup.LayoutParams.WRAP_CONTENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    )
    buttonParams.topMargin = dp(24)
    column.addView(button, buttonParams)

    addView(
      column,
      FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    )
  }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (event.keyCode == KeyEvent.KEYCODE_BACK) {
      if (event.action == KeyEvent.ACTION_UP) {
        onGoBack()
      }
      return true
    }
    return super.dispatchKeyEvent(event)
  }
}
