    document.addEventListener('DOMContentLoaded', function() {
            const amountInput = document.getElementById('amount');
            const fromCurrencySelect = document.getElementById('fromCurrency');
            const toCurrencySelect = document.getElementById('toCurrency');
            const convertBtn = document.getElementById('convertBtn');
            const resultDiv = document.getElementById('result');
            const loadingDiv = document.getElementById('loading');
            const lastUpdateDiv = document.getElementById('lastUpdate');
            
            // Armazenar taxas de câmbio e o timestamp da última atualização
            let rateData = {};
            let lastUpdate = null;
            
            // Função para obter a taxa diretamente na conversão
            async function getDirectExchangeRate(from, to) {
                loadingDiv.style.display = 'block';
                resultDiv.textContent = "Buscando taxa atual...";
                
                try {
                    // Usando a API alternativa que é mais confiável
                    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
                    const data = await response.json();
                    
                    if (data && data.rates && data.rates[to] !== undefined) {
                        // Guardar a taxa atual e a data
                        const now = new Date();
                        lastUpdate = now;
                        // Atualizar a mensagem com horário atual
                        lastUpdateDiv.innerHTML = `Última atualização: ${now.toLocaleTimeString()} <button id="refreshBtn" class="refresh-btn">Atualizar</button>`;
                        
                        // Adicionar evento ao botão de atualização
                        document.getElementById('refreshBtn').addEventListener('click', function() {
                            getDirectExchangeRate(fromCurrencySelect.value, toCurrencySelect.value)
                                .then(() => convertCurrency());
                        });
                        
                        // Armazenar taxa
                        if (!rateData[from]) {
                            rateData[from] = {};
                        }
                        rateData[from][to] = data.rates[to];
                        
                        return data.rates[to];
                    } else {
                        throw new Error('Falha ao buscar taxas de câmbio');
                    }
                } catch (error) {
                    resultDiv.textContent = "Erro ao buscar taxas. Tente novamente.";
                    console.error('Erro ao buscar taxa de câmbio:', error);
                    return null;
                } finally {
                    loadingDiv.style.display = 'none';
                }
            }
            
            // Obter taxa inicial
            getDirectExchangeRate('BRL', 'EUR');
            
            // Função para animar as patas quando o botão é clicado
            function animatePaws() {
                const paws = document.querySelectorAll('.paw');
                paws.forEach((paw, index) => {
                    setTimeout(() => {
                        paw.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            paw.style.transform = 'translateY(0)';
                        }, 300);
                    }, index * 100);
                });
            }
            
            // Função para converter moedas
            async function convertCurrency() {
                const amount = parseFloat(amountInput.value);
                const fromCurrency = fromCurrencySelect.value;
                const toCurrency = toCurrencySelect.value;
                
                if (isNaN(amount) || amount <= 0) {
                    resultDiv.textContent = "Por favor, digite um valor válido!";
                    resultDiv.style.color = "#B76E79";
                    return;
                }
                
                // Verificar se já temos a taxa armazenada para este par de moedas
                let rate;
                if (rateData[fromCurrency] && rateData[fromCurrency][toCurrency]) {
                    rate = rateData[fromCurrency][toCurrency];
                } else {
                    // Se não tivermos a taxa, buscá-la agora
                    rate = await getDirectExchangeRate(fromCurrency, toCurrency);
                    if (!rate) return; // Se falhou em obter a taxa
                }
                
                // Calcular o resultado
                const result = amount * rate;
                
                // Formatar o resultado com o símbolo da moeda
                let formattedResult;
                switch(toCurrency) {
                    case 'USD':
                        formattedResult = `$${result.toFixed(2)}`;
                        break;
                    case 'BRL':
                        formattedResult = `R$${result.toFixed(2)}`;
                        break;
                    case 'EUR':
                        formattedResult = `€${result.toFixed(2)}`;
                        break;
                    case 'GBP':
                        formattedResult = `£${result.toFixed(2)}`;
                        break;
                    case 'JPY':
                        formattedResult = `¥${result.toFixed(0)}`;
                        break;
                    default:
                        formattedResult = result.toFixed(2);
                }
                
                resultDiv.textContent = formattedResult;
                resultDiv.style.color = "#B76E79";
                
                // Animar as patas
                animatePaws();
            }
            
            // Adicionar evento de clique ao botão
            convertBtn.addEventListener('click', convertCurrency);
            
            // Permitir converter pressionando Enter no campo de valor
            amountInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    convertCurrency();
                }
            });
            
            // Atualizar taxas quando mudar as moedas
            fromCurrencySelect.addEventListener('change', function() {
                getDirectExchangeRate(this.value, toCurrencySelect.value);
            });
            
            toCurrencySelect.addEventListener('change', function() {
                getDirectExchangeRate(fromCurrencySelect.value, this.value);
            });

            // Esconder o teclado numérico ao tocar fora dos inputs em dispositivos móveis
            document.addEventListener('touchstart', function(e) {
                if (!e.target.closest('input') && !e.target.closest('select') && !e.target.closest('button')) {
                    document.activeElement.blur();
                }
            });
        });