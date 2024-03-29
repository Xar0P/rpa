@echo off
set currentPath=%cd%

cd %USERPROFILE%\AppData\Local\ms-playwright\firefox*\firefox
start firefox.exe -p https://google.com https://mercadolivre.com.br https://login.aliexpress.com/ https://www.alibaba.com/
PAUSE

cd %currentPath%
cd ..\..

cd %USERPROFILE%\AppData\Roaming\Mozilla\Firefox\Profiles\*pw
@set profilePath=%cd%
cd %currentPath%
cd ..\..
echo PROFILE=%profilePath% > .env

echo Digite o caminho que você quer salvar o arquivo
@set /p DIR_SAVE=
echo DIR_SAVE=%DIR_SAVE%\Rastreios.xlsx >> .env

echo Digite o email do mercado livre
@set /p ML_LOGIN=
echo ML_LOGIN=%ML_LOGIN% >> .env

echo Digite a senha do mercado livre
@set /p ML_PASS=
echo ML_PASS=%ML_PASS% >> .env

echo Digite o email do aliexpress
@set /p ALX_LOGIN=
echo ALX_LOGIN=%ALX_LOGIN% >> .env

echo Digite a senha do aliexpress
@set /p ALX_PASS=
echo ALX_PASS=%ALX_PASS% >> .env

@REM echo Digite o email do alibaba
@REM @set /p ALBB_LOGIN=
@REM echo ALBB_LOGIN=%ALBB_LOGIN% >> .env

@REM echo Digite a senha do alibaba
@REM @set /p ALBB_PASS=
@REM echo ALBB_PASS=%ALBB_PASS% >> .env

@REM echo Digite o totp do alibaba
@REM @set /p ALBB_TOTP=
@REM echo ALBB_TOTP=%ALBB_TOTP% >> .env

echo Configurado com sucesso!
