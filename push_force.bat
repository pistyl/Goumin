@echo off
set "GIT_PATH="
if exist "C:\Program Files\Git\cmd\git.exe" set "GIT_PATH=C:\Program Files\Git\cmd\git.exe"
if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "GIT_PATH=C:\Program Files (x86)\Git\cmd\git.exe"
if exist "C:\Users\USER\AppData\Local\Programs\Git\cmd\git.exe" set "GIT_PATH=C:\Users\USER\AppData\Local\Programs\Git\cmd\git.exe"

if "%GIT_PATH%"=="" (
  where git >tmp_git.txt 2>nul
  set /p GIT_PATH=<tmp_git.txt
  del tmp_git.txt
)

if "%GIT_PATH%"=="" (
  echo [ERROR] Git introuvable sur le systeme.
  exit /b 1
)

echo [INFO] Git trouve a l'emplacement : %GIT_PATH%
echo [INFO] Indexation des fichiers...
"%GIT_PATH%" add .
echo [INFO] Creation du commit...
"%GIT_PATH%" commit -m "feat: deployment of admin back-office features"
echo [INFO] Push vers GitHub...
"%GIT_PATH%" push -u -f origin master
if %ERRORLEVEL% neq 0 (
  "%GIT_PATH%" push -u -f origin main
)
echo [INFO] Operations terminees !
