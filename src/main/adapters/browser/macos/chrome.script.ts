export const CHROME_SCAN_SCRIPT = `
if application id "com.google.Chrome" is not running then
  return "NOT_RUNNING"
end if

set urlList to {"RUNNING"}

tell application id "com.google.Chrome"
  repeat with browserWindow in windows
    repeat with browserTab in tabs of browserWindow
      set tabUrl to URL of browserTab

      if tabUrl is not missing value then
        set end of urlList to tabUrl as text
      end if
    end repeat
  end repeat
end tell

set AppleScript's text item delimiters to linefeed

return urlList as text
`;
