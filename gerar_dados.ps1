# MENU INTERATIVO - GERADOR DE DADOS
# Uso: .\gerar_dados.ps1

# Configurações Base
$baseUrl = "http://localhost:8080"
$headers = @{ "Content-Type" = "application/json" }

function Obter-Token {
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "      GERADOR DE DADOS - NOMEAÇÃO          " -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    
    $token = Read-Host "Cole seu token (pegue no console do navegador com localStorage.getItem('token'))"
    $token = $token -replace '^Bearer\s+', '' -replace '"', '' -replace "'", ""
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host "Token inválido!" -ForegroundColor Red
        exit
    }
    return "Bearer $token"
}

function Gerar-Materias {
    param($token)
    $headers["Authorization"] = $token
    
    $qtd = Read-Host "Quantas matérias deseja criar? (Padrão: 5)"
    if (!$qtd) { $qtd = 5 }
    
    $nomes = @("Direito Constitucional", "Direito Administrativo", "Português", "Raciocínio Lógico", "Informática", "Direito Penal", "Direito Civil", "Contabilidade", "Auditoria", "Economia")
    
    for ($i = 1; $i -le $qtd; $i++) {
        $nomeBase = $nomes | Get-Random
        $nomeFinal = "$nomeBase " + (Get-Random -Minimum 100 -Maximum 999)
        
        $body = @{ nome = $nomeFinal } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri "$baseUrl/materias" -Method Post -Headers $headers -Body $body -ErrorAction Stop | Out-Null
            Write-Host "[$i/$qtd] Criada: $nomeFinal" -ForegroundColor Green
        } catch {
            Write-Host "[$i/$qtd] Erro ao criar $nomeFinal" -ForegroundColor Red
        }
    }
}

function Gerar-Concursos {
    param($token)
    $headers["Authorization"] = $token
    
    $qtd = Read-Host "Quantos concursos deseja criar? (Padrão: 2)"
    if (!$qtd) { $qtd = 2 }
    
    $bancas = @("Cebraspe", "FGV", "Vunesp", "FCC", "Idecan")
    $cargos = @("Auditor", "Analista", "Técnico", "Gestor", "Delegado")
    
    for ($i = 1; $i -le $qtd; $i++) {
        $banca = $bancas | Get-Random
        $cargo = $cargos | Get-Random
        $nomeConcurso = "$cargo - $banca " + (Get-Random -Minimum 2024 -Maximum 2026)
        
        $body = @{
            nome = $nomeConcurso
            banca = $banca
            dataProva = (Get-Date).AddMonths((Get-Random -Minimum 2 -Maximum 12)).ToString("yyyy-MM-dd")
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri "$baseUrl/concursos" -Method Post -Headers $headers -Body $body -ErrorAction Stop | Out-Null
            Write-Host "[$i/$qtd] Criado: $nomeConcurso" -ForegroundColor Green
        } catch {
             Write-Host "[$i/$qtd] Erro ao criar $nomeConcurso" -ForegroundColor Red
        }
    }
}

function Gerar-Registros {
    param($token)
    $headers["Authorization"] = $token

    # 1. Busca Matérias Disponíveis
    Write-Host "Buscando matérias..." -ForegroundColor Yellow
    try {
        $materias = (Invoke-RestMethod -Uri "$baseUrl/materias" -Method Get -Headers $headers).id
        if (!$materias) { throw "Sem matérias" }
    } catch {
        Write-Host "Erro: Nenhuma matéria encontrada. Crie matérias primeiro!" -ForegroundColor Red
        return
    }

    $qtd = Read-Host "Quantos registros de estudo deseja criar?"
    if (!$qtd -or $qtd -le 0) { return }

    Write-Host "Gerando $qtd registros (1h duração, 10 questões, matérias aleatórias)..." -ForegroundColor Yellow

    for ($i = 1; $i -le $qtd; $i++) {
        $materiaId = $materias | Get-Random
        
        # Data aleatória nos últimos 7 dias
        $diasAtras = Get-Random -Minimum 0 -Maximum 7
        $horasAtras = Get-Random -Minimum 0 -Maximum 23
        $dataInicio = (Get-Date).AddDays(-$diasAtras).AddHours(-$horasAtras).ToString("yyyy-MM-ddTHH:mm:ss")

        $body = @{
            materiaId = $materiaId
            dataInicio = $dataInicio
            segundos = 3600               # 1 Hora fixa
            questoesFeitas = 10           # 10 Questões fixas
            questoesCertas = (Get-Random -Minimum 5 -Maximum 10)
            contarHorasNoCiclo = $true
            anotacoes = "Registro Automático #$i"
        } | ConvertTo-Json

        try {
            Invoke-RestMethod -Uri "$baseUrl/registros" -Method Post -Headers $headers -Body $body -ErrorAction Stop | Out-Null
            Write-Host "[$i/$qtd] Sucesso! Matéria ID: $materiaId | Data: $dataInicio" -ForegroundColor Green
        } catch {
             Write-Host "[$i/$qtd] Erro ao criar registro" -ForegroundColor Red
        }
    }
}

# --- Loop Principal ---
$tokenAuth = Obter-Token

do {
    Write-Host "`n--- MENU PRINCIPAL ---" -ForegroundColor Cyan
    Write-Host "1. Gerar Matérias"
    Write-Host "2. Gerar Concursos"
    Write-Host "3. Gerar Registros de Estudo"
    Write-Host "0. Sair"
    
    $opcao = Read-Host "Escolha uma opção"
    
    switch ($opcao) {
        "1" { Gerar-Materias -token $tokenAuth }
        "2" { Gerar-Concursos -token $tokenAuth }
        "3" { Gerar-Registros -token $tokenAuth }
        "0" { Write-Host "Saindo..."; break }
        default { Write-Host "Opção inválida" -ForegroundColor Red }
    }
} while ($opcao -ne "0")
