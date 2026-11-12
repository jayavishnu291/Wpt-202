
Pod::Spec.new do |s|
  s.name             = 'wpt202-alarmkit'
  s.version          = '1.0.0'
  s.summary          = 'WPT202 iPhone AlarmKit module'
  s.description      = 'Native AlarmKit integration for WPT202'
  s.license          = { :type => 'MIT' }
  s.author           = 'WPT202'
  s.homepage         = 'https://docs.expo.dev/modules/'

  s.platform         = :ios, '26.0'
  s.swift_version    = '5.9'
  s.source           = { :path => '.' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'AlarmKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
