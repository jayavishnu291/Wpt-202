
Pod::Spec.new do |s|
  s.name           = 'lifecycle-state'
  s.version        = '1.0.0'
  s.summary        = 'WPT202 iOS lifecycle detection'
  s.description    = 'Native iOS lifecycle state module for WPT202.'
  s.license        = { :type => 'MIT' }
  s.author         = 'WPT202 Team'
  s.homepage       = 'https://expo.dev'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => 'https://github.com/expo/expo.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,mm,swift}'
  s.swift_version = '5.9'
end
