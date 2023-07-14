<#
C:\Program Files\OpenSSL-Win64
https://slproweb.com/download/Win64OpenSSL_Light-3_1_1.exe
C:\Program Files\OpenSSL-Win64\bin
#>

param(
    [switch]$installDevCluster,
    $certSubjectName = 'CN=ServiceFabricDevClusterCert',
    $certPassword = '1234', #'N0tSecure123',
   # $certPfxFile = '',
    $certPemFile = "$PSScriptRoot\..\test-certs\$($env:computername)\ServiceFabricDevClusterCert.pem"
)

$certPfx = $null
function main(){
    $error.Clear()
    openssl | out-null
    if($error){
        write-error "download and install openssl from https://slproweb.com/download/Win64OpenSSL_Light-3_1_1.exe
        add path to environment variables"
        return
    }

    if($installDevCluster){
        . $PSScriptRoot\sf-dev-cluster-secure.ps1
    }

$destPath = "$PSScriptRoot\..\test-certs\$($env:computername)"

    if(!(test-path $destPath)){
        mkdir $destPath
    }

    #if(!(test-path $certPfxFile)){
        write-host "enumerating dev certificate"
        $certPfx = Get-ChildItem cert:\CurrentUser\my | where-object Subject -imatch $certSubjectName
        write-host "service fabric dev cluster cert: $($certPfx | Format-List *| out-string)" -ForegroundColor Green
        $certPfxFile = "$destPath\cert.pfx"
        write-host "exporting dev certificate to $certPfxFile"
        $certPfx | Export-PfxCertificate -FilePath $certPfxFile -Password (ConvertTo-SecureString -String $certPassword -Force -AsPlainText)
    #}

    if(!$certPfx){
        write-error "certificate not found"
        return
    }

    $certNoKeyPemFile = $certPemFile -replace '\.pem$', '.nokey.pem'
    #$certWithKeyPemFile = $certPemFile -replace '\.pem$', '.withkey.pem'
    $certKeyFile = $certPemFile -replace '\.pem$', '.key'
    # $certComboPemFile = $certPemFile -replace '\.pem$', '.combo.pem'

    write-host "openssl pkcs12 -in $certPfxFile -out $certNoKeyPemFile -nokeys" -ForegroundColor Green
    write-host "enter password: $certPassword" -ForegroundColor Cyan
    openssl pkcs12 -in $certPfxFile -out $certNoKeyPemFile -nokeys

    write-host "openssl pkcs12 -in $certPfxFile -out $certPemFile" -ForegroundColor Green
    write-host "enter password: $certPassword" -ForegroundColor Cyan
    openssl pkcs12 -in $certPfxFile -out $certWithKeyPemFile

    write-host "openssl rsa -in $certPemFile -out $certKeyFile" -ForegroundColor Green
    write-host "enter password: $certPassword" -ForegroundColor Cyan
    openssl rsa -in $certPemFile -out $certKeyFile

    # write-host "get-content $certNoKeyPemFile $certKeyFile > $certComboPemFile"
    # get-content $certNoKeyPemFile $certKeyFile > $certComboPemFile

}

main
