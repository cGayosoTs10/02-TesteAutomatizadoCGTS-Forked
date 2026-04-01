import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://cgayosots10.github.io/02-TesteAutomatizadoCGTS-Forked/');
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========
  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linhas = page.locator('#tabela-alunos tbody tr');
      const linhaJoao = linhas.filter({ hasText: 'João Silva' });

      await expect(linhas).toHaveCount(1);
      await expect(linhaJoao).toHaveCount(1);
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const mensagem = page.locator('#mensagem');
      await expect(mensagem).toBeVisible();
      await expect(mensagem).toContainText('cadastrado com sucesso');
      await expect(mensagem).toHaveClass(/sucesso/);
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const mensagem = page.locator('#mensagem');
      await expect(mensagem).toContainText('Por favor, preencha o nome do aluno.');
      
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('deve permitir múltiplos cadastros consecutivos', async ({ page }) => {
      const alunos = ['Aluno 1', 'Aluno 2', 'Aluno 3'];
      
      for (const aluno of alunos) {
        await page.getByLabel('Nome do Aluno').fill(aluno);
        await page.getByLabel('Nota 1').fill('7');
        await page.getByLabel('Nota 2').fill('7');
        await page.getByLabel('Nota 3').fill('7');
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      const linhas = page.locator('#tabela-alunos tbody tr');
      await expect(linhas).toHaveCount(3);
    });

  });

  // ========== GRUPO 2: Cálculo e Validação de Notas ==========
  test.describe('Cálculo e Validação de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaMedia = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

    test('não deve aceitar notas fora do intervalo 0-10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Debugger');
      await page.getByLabel('Nota 1').fill('11');
      await page.getByLabel('Nota 2').fill('-1');
      await page.getByLabel('Nota 3').fill('12');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const mensagem = page.locator('#mensagem');
      await expect(mensagem).toBeVisible();
      await expect(mensagem).toContainText('As notas devem estar entre 0 e 10.');
      
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 3: Situação do Aluno ==========
  test.describe('Situação do Aluno', () => {

    test('deve exibir situação "Aprovado" para média >= 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Marcos');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.getByText('Aprovado', { exact: true })).toBeVisible();
    });

    test('deve exibir situação "Recuperação" para média >= 5 e < 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Julia');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.getByText('Recuperação', { exact: true })).toBeVisible();
    });

    test('deve exibir situação "Reprovado" para média < 5', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Lucas');
      await page.getByLabel('Nota 1').fill('4');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('4');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.getByText('Reprovado', { exact: true })).toBeVisible();
    });

  });

  // ========== GRUPO 4: Fluxos e Interações ==========
  test.describe('Interações na Tabela e Estatísticas', () => {

    test('deve filtrar aluno corretamente pela busca', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Carlos');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Maria');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('8');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Considerando que o input de busca tenha um placeholder, caso contrário, mantemos o seletor de id para a busca
      const campoBusca = page.locator('#busca'); 
      await campoBusca.fill('Maria');

      const linhas = page.locator('#tabela-alunos tbody tr');
      await expect(linhas).toHaveCount(1);
      await expect(linhas.first()).toContainText('Maria');
    });

    test('deve remover aluno da tabela ao clicar em excluir', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Exclusao');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Usando o aria-label gerado dinamicamente pelo JS!
      await page.getByRole('button', { name: 'Excluir Aluno Exclusao' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
      await expect(page.locator('#mensagem')).toContainText('removido com sucesso');
    });

    test('deve atualizar os cards de estatísticas corretamente', async ({ page }) => {
      // Aprovado
      await page.getByLabel('Nome do Aluno').fill('Aprovado Silva');
      await page.getByLabel('Nota 1').fill('10');
      await page.getByLabel('Nota 2').fill('10');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Recuperação
      await page.getByLabel('Nome do Aluno').fill('Recuperacao Costa');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Reprovado
      await page.getByLabel('Nome do Aluno').fill('Reprovado Santos');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('3');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#stat-total')).toHaveText('3');
      await expect(page.locator('#stat-aprovados')).toHaveText('1');
      await expect(page.locator('#stat-recuperacao')).toHaveText('1');
      await expect(page.locator('#stat-reprovados')).toHaveText('1');
    });

  });

});