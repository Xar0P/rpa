@echo off

cd %USERPROFILE%\AppData\Local\ms-playwright\firefox*\firefox
start firefox.exe -p https://google.com https://mercadolivre.com.br https://login.aliexpress.com/ https://www.alibaba.com/
PAUSE