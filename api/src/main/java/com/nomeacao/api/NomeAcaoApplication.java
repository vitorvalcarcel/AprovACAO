package com.nomeacao.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NomeAcaoApplication {

	public static void main(String[] args) {
		SpringApplication.run(NomeAcaoApplication.class, args);
	}

}