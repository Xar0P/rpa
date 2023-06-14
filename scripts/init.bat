@echo off
set initPath=%cd%\init

cd %initPath%
call install-yarn.bat

cd %initPath%
call install-dependecies.bat

cd %initPath%
call install-firefox.bat

cd %initPath%
call config.bat

pause